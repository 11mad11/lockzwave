import {io, Socket} from "socket.io-client";
import Prompt from 'prompt';
import {DefaultEventsMap} from "socket.io-client/build/typed-events";
import {Command, MenuState, Modifier, ModifierByState, State} from "./def";
import {helpMenu} from "./menus/help";
import {serverMenu} from "./menus/server";
import {controllerMenu} from "./menus/controller";

Prompt.start();


const state: State = {
    url: "https://zwave-server.cap.11mad11.com",
    menuState: MenuState.Main,
};

const modifiers: Record<MenuState, Modifier[]> = mergeModifier([
    serverMenu,
    helpMenu,
    controllerMenu
]);

;(async function () {
    while (true) {
        let cmds: Command[] = [];
        for (const modifier of modifiers[state.menuState]) {
            cmds = await modifier(cmds,state);
        }
        
        for (let i = 0; i < cmds.length; i++) {
            console.log(i, cmds[i].name);
        }
        
        const {option} = await Prompt.get([{
            name: "option",
            type: "integer",
            minimum: 0,
            maximum: cmds.length
        }]);
        
        
        await cmds[option as number].fn();
    }
    
    
    //get a list of controllers info
    
})()




function mergeModifier(mbs: ModifierByState[]): Record<MenuState, Modifier[]> {
    return Object.keys(MenuState).filter(key => !isNaN(Number(key))).map(s => s as unknown as MenuState).reduce((a, v) => {
        a[v] = mbs.reduce((a, m) => {
            const ms = m[v];
            if (Array.isArray(ms))
                a.push(...ms);
            else if(ms)
                a.push(ms);
            return a;
        }, [] as Modifier[])
        return a;
    }, {} as Record<MenuState, Modifier[]>);
}
