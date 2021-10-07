import {io, Socket} from "socket.io-client";
import {init} from "./main";
import {DoorLockMode, Driver} from "zwave-js";
import {ControllerEmitEvents, ControllerListenEvents} from "../shared/ControllerEventsMap";
import {Config} from "./Config";

declare module "./Config" {
    interface ConfigDef {
        socket: {
            url: string
        },
        state:{
            nodes:{
                [nodeId:number]: {
                    t:5
                }
            }
        }
    }
}

(async function () {
    const config = new Config();
    const driver = await init(config);
    
    const socket: Socket<ControllerListenEvents, ControllerEmitEvents> = io(config.config.socket.url ||  "http://localhost:3000");
    
    socket.on("connect", () => {
        // ...
    });
    
    registerEvent(socket, driver);
    
    socket.on("info", () => {
        socket.emit("info", "My info", process.env,config.config.state);
    });
    
    socket.on("lock", () => {
        console.log("lock cmd")
        driver.controller.nodes.get(6).commandClasses["Door Lock"].set(DoorLockMode.Secured);
    });
    socket.on("unlock", () => {
        console.log("unlock cmd")
        driver.controller.nodes.get(6).commandClasses["Door Lock"].set(DoorLockMode.Unsecured);
    });
})();

function registerEvent(socket: Socket<ControllerListenEvents, ControllerEmitEvents>, driver: Driver) {
    driver.on("all nodes ready", () => {
        socket.emit("all nodes ready");
    });
    driver.on("error", (err) => {
        socket.emit("error", err.message);
    });
    
    driver.controller.on("exclusion started", () => {
        socket.emit("exclusion started");
    });
    driver.controller.on("exclusion stopped", () => {
        socket.emit("exclusion stopped");
    });
    driver.controller.on("exclusion failed", () => {
        socket.emit("exclusion failed");
    });
    
    driver.controller.on("inclusion started", (secure, strategy) => {
        socket.emit("inclusion started", secure, strategy);
    });
    driver.controller.on("inclusion stopped", () => {
        socket.emit("inclusion stopped");
    });
    driver.controller.on("inclusion failed", () => {
        socket.emit("inclusion failed");
    });
    
    driver.controller.on("node added", (node, result) => {
        socket.emit("node added", node.nodeId, result);
    });
    driver.controller.on("node removed", (node, replaced) => {
        socket.emit("node removed", node.nodeId, replaced);
    });
    
    driver.controller.on("heal network progress", (progress) => {
        socket.emit("heal network progress", Object.fromEntries(progress));
    });
    driver.controller.on("heal network done", (result) => {
        socket.emit("heal network done", Object.fromEntries(result));
    });
    
    driver.controller.on("statistics updated", (statistics) => {
        socket.emit("statistics updated", statistics);
    });
}
