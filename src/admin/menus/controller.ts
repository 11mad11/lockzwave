import {MenuState, Modifier, ModifierByState} from "../def";
import {io} from "socket.io-client";
import Prompt from "prompt";
import {sleep} from "../../shared/helper";

export const controllerMenu: ModifierByState = {//TODO better menu
    [MenuState.Main]: async function (cmds, state) {
        if (!state.serverSocket || state.controllerSocket?.connected)
            return cmds;
    
        cmds.push({
            name: "connect to controller",
            async fn() {
                return new Promise((resolve)=>{
                    state.serverSocket.emit("list");
                    state.serverSocket.once("controllers", async (controllers: string[]) => {
                        if(!controllers.length)
                            return resolve();
                        
                        for (let i = 0; i < controllers.length; i++) {
                            const controller = controllers[i];
                            const cSocket = io("https://zwave-server.cap.11mad11.com" + controller);
                            cSocket.once("info", (...args) => {
                                console.log(i, args[0]);
                                cSocket.disconnect();
                            })
                            cSocket.emit("info");
                        }
        
                        console.log("waiting 5 sec");
                        await sleep(5000);
        
                        const {controller} = await Prompt.get([{
                            name: "controller",
                            type: "integer",
                            minimum: 0,
                            maximum: controllers.length - 1
                        }]);
        
                        state.controllerSocket = io("https://zwave-server.cap.11mad11.com" + controllers[controller as number]);
        
                        await sleep(1000);
                        resolve();
                    });
                })
            }
        });
        
        return cmds;
    }
}
