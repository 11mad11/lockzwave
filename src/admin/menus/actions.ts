import {MenuState, Modifier, ModifierByState} from "../def";
import {io} from "socket.io-client";
import Prompt from "prompt";
import {sleep} from "../../shared/helper";

export const actionsMenu: ModifierByState = {
    [MenuState.Main]: async function (cmds, state) {
        if (!state.controllerSocket)
            return cmds;
        
        cmds.push({
            name: "start inclusion",
            async fn() {
                state.controllerSocket.emit("inclusion");
            }
        });
        cmds.push({
            name: "start exclusion",
            async fn() {
                state.controllerSocket.emit("exclusion");
            }
        });
        cmds.push({
            name: "change code",
            async fn() {
                const {index, code} = await Prompt.get([{
                    name: "index",
                    type: "integer",
                    minimum: 1,
                    maximum: 255
                }, {
                    name: "code",
                    type: "string",
                    minimum: 4,
                    maximum: 6
                }]);
                state.controllerSocket.emit("change code", parseInt(index as string,10), code as string);
            }
        });
        cmds.push({
            name: "remove code",
            async fn() {
                const {index} = await Prompt.get([{
                    name: "index",
                    type: "integer",
                    minimum: 1,
                    maximum: 255
                }]);
                state.controllerSocket.emit("remove code", parseInt(index as string,10));
            }
        });
        cmds.push({
            name: "lock all",
            async fn() {
                state.controllerSocket.emit("lock all");
            }
        });
        
        return cmds;
    }
}
