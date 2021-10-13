import {io, Socket} from "socket.io-client";
import {init} from "./main";
import {Driver, InclusionStrategy, UserIDStatus} from "zwave-js";
import {ControllerEmitEvents, ControllerListenEvents} from "../shared/ControllerEventsMap";
import {Config} from "./Config";

declare module "./Config" {
    interface ConfigDef {
        socket: {
            url: string
        },
        state: {
            nodes: {
                [nodeId: number]: {
                    t: 5
                }
            }
        }
    }
}

(async function () {
    const config = new Config();
    const driver = await init(config);
    
    const socket: Socket<ControllerListenEvents, ControllerEmitEvents> = io(config.config?.socket?.url || "https://zwave-server.cap.11mad11.com/");
    
    
    socket.on("connect", () => {
        // ...
    });
    
    registerEvent(socket, driver);
    
    socket.on("info", async () => {
        socket.emit("info", driver.controller.homeId, process.env);
    });
    
    socket.on("exclusion", async () => {
        console.log("exclusion cmd")
        try {
            await driver.controller.stopInclusion();
            await driver.controller.stopInclusion();
            await driver.controller.beginExclusion()
        } catch (e) {
            socket.emit("error", e?.message);
        }
    });
    socket.on("inclusion", async () => {
        console.log("inclusion cmd")
        try {
            await driver.controller.stopInclusion();
            await driver.controller.stopExclusion();
            await driver.controller.beginInclusion({
                strategy: InclusionStrategy.Insecure
            })
        } catch (e) {
            socket.emit("error", e?.message);
        }
    });
    
    socket.on("change code", async (index,code) => {
        console.log("change code cmd")
        try {
            driver.controller.nodes.forEach((value) => {
                if (value.commandClasses["User Code"].isSupported()) {
                    value.commandClasses["User Code"].set(index, UserIDStatus.Enabled, code);
                }
            })
        } catch (e) {
            socket.emit("error", e?.message);
        }
    });
})();

function registerEvent(socket: Socket<ControllerListenEvents, ControllerEmitEvents>, driver: Driver) {
    driver.on("all nodes ready", () => {
        socket.volatile.emit("all nodes ready");
    });
    driver.on("error", (err) => {
        socket.volatile.emit("error", err.message);
    });
    
    driver.controller.on("exclusion started", () => {
        socket.volatile.emit("exclusion started");
    });
    driver.controller.on("exclusion stopped", () => {
        socket.volatile.emit("exclusion stopped");
    });
    driver.controller.on("exclusion failed", () => {
        socket.volatile.emit("exclusion failed");
    });
    
    driver.controller.on("inclusion started", (secure, strategy) => {
        socket.volatile.emit("inclusion started", secure, strategy);
    });
    driver.controller.on("inclusion stopped", () => {
        socket.volatile.emit("inclusion stopped");
    });
    driver.controller.on("inclusion failed", () => {
        socket.volatile.emit("inclusion failed");
    });
    
    driver.controller.on("node added", (node, result) => {
        socket.volatile.emit("node added", node.nodeId, result);
    });
    driver.controller.on("node removed", (node, replaced) => {
        socket.volatile.emit("node removed", node.nodeId, replaced);
    });
    
    driver.controller.on("heal network progress", (progress) => {
        socket.volatile.emit("heal network progress", Object.fromEntries(progress));
    });
    driver.controller.on("heal network done", (result) => {
        socket.volatile.emit("heal network done", Object.fromEntries(result));
    });
    
    driver.controller.on("statistics updated", (statistics) => {
        socket.volatile.emit("statistics updated", statistics);
    });
}
