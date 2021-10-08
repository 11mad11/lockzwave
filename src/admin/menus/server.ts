import {MenuState, Modifier, ModifierByState} from "../def";
import {io} from "socket.io-client";
import Prompt from "prompt";
import {sleep} from "../../shared/helper";

export const serverMenu: ModifierByState = {
    [MenuState.Main]: async function (cmds, state) {
        
        
        if (state.serverSocket)
            return cmds;
        
        cmds.push({
            name: "connect to server",
            async fn() {
                const {url,password} = await Prompt.get([
                    {name: "url", default: "https://zwave-server.cap.11mad11.com/"},
                    {name: "password", default: "2600"},
                ]);
                state.url = url as string;
                state.serverSocket = io(state.url, {
                    auth: {
                        token: password as string
                    }
                });
                state.serverSocket.on("connect", () => {
                    console.log("Connected to server")
                });
            }
        });
        
        return cmds;
    }
}
