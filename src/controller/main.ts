import {Driver} from "zwave-js";
import {Config, ConfigDef} from "./Config";

let driver: Driver = undefined;

declare module "./Config" {
    interface ConfigDef {
        driver: {
            port: string,
            logLevel: number,
            S2_Unauthenticated: string,
            S2_Authenticated: string,
            S2_AccessControl: string,
            S0_Legacy: string,
        }
    }
}

export async function init(config?: Config): Promise<Driver> {
    if (driver)
        return driver;
    
    if (!config)
        throw new Error("need config to initiate")
    
    driver = new Driver(config.config?.driver?.port ||  "/dev/ttyUSB0", {
        securityKeys: {
            S2_Unauthenticated: Buffer.from(config.config?.driver?.S2_Unauthenticated ||  "11223344556677889900aabbccddeeff", "hex",),
            S2_Authenticated: Buffer.from(config.config?.driver?.S2_Authenticated ||  "10203040506070809000a0b0c0d0e0f0", "hex",),
            S2_AccessControl: Buffer.from(config.config?.driver?.S2_AccessControl ||  "aaaabbbbccccdddd1111222233334444", "hex",),
            S0_Legacy: Buffer.from(config.config?.driver?.S0_Legacy ||  "0102030405060708090a0b0c0d0e0f10", "hex"),
        }
    });
    
    driver.on("error", (e) => {
        console.error(e);
    });
    
    
    await new Promise((resolve, reject) => {
        driver.once("driver ready", () => {
            resolve(undefined);
        });
        driver.start();
        driver.updateLogConfig({
            level: config.config?.driver?.logLevel || 0
        });
    });
    
    
    return driver;
}

export async function debug(full: boolean = false) {
    const nodes: Promise<any>[] = [];
    
    driver.controller.nodes.forEach((node) => {
        nodes.push(new Promise(async (resolve, reject) => {
            const out: any = {
                nodeId: node.nodeId,
                name: node.name,
                type: node.nodeType,
                deviceConfig: node.deviceConfig,
                endpoints: {}
            };
            
            for (const ep of node.getAllEndpoints()) {
                const epOut: any = {
                    cc: ep.getSupportedCCInstances().map(cc => cc.ccName),
                };
                
                if (ep.commandClasses["Association Group Information"].isSupported() && ep.commandClasses["Association"].isSupported()) {
                    const agi: any = [];
                    epOut.agi = agi;
                    
                    const len = await ep.commandClasses["Association"].getGroupCount();
                    for (let i = 0; i < len; i++) {
                        const name = await ep.commandClasses["Association Group Information"].getGroupName(i);
                        const info = await ep.commandClasses["Association Group Information"].getGroupInfo(i);
                        
                        agi.push({
                            name, info
                        })
                    }
                }
                
                if (ep.commandClasses["Alarm Sensor"].isSupported())
                    epOut.alarms = await ep.commandClasses["Alarm Sensor"].getSupportedSensorTypes();
                
                if (ep.commandClasses.Battery.isSupported())
                    epOut.battery = {
                        info: await tryAsync(() => ep.commandClasses.Battery.get()),
                        health: await tryAsync(() => ep.commandClasses.Battery.getHealth()),
                    };
                
                if (ep.commandClasses["User Code"].isSupported()) {
                    epOut.keypad = {
                        master: await tryAsync(() => ep.commandClasses["User Code"].getMasterCode()),
                        users_count: await tryAsync(() => ep.commandClasses["User Code"].getUsersCount()),
                        mode: await tryAsync(() => ep.commandClasses["User Code"].getKeypadMode()),
                        cap: await tryAsync(() => ep.commandClasses["User Code"].getCapabilities()),
                    };
                    
                    if (full) {
                        epOut.keypad.users = {};
                        for (let i = 0; i < epOut.keypad.users_count; i++) {
                            epOut.keypad.users[i] = await ep.commandClasses["User Code"].get(i);
                        }
                    }
                }
                
                if (ep.commandClasses["Door Lock"].isSupported()) {
                    epOut.door = {
                        get: await tryAsync(() => ep.commandClasses["Door Lock"].get()),
                        config: await tryAsync(() => ep.commandClasses["Door Lock"].getConfiguration()),
                        cap: await tryAsync(() => ep.commandClasses["Door Lock"].getCapabilities()),
                    }
                }
                
                out.endpoints[ep.index] = (epOut);
            }
            
            console.log("done node");
            resolve(out);
        }))
    });
    
    return await Promise.all(nodes)
}

async function tryAsync<T>(fn: () => Promise<T>, def?: T): Promise<T | undefined> {
    try {
        return await fn();
    } catch (e) {
        console.error(e?.message || e);
        return def;
    }
}
