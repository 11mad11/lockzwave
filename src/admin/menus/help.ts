import {MenuState, Modifier, ModifierByState} from "../def";

export const helpMenu: ModifierByState = {
    [MenuState.Main]: async function (cmds, state) {
        cmds.push({
            name: "help",
            desc: "This Message",
            async fn() {
                console.log("Sorry! this is to do");//TODO help msg
                state.menuState = MenuState.Main;
            }
        })
        return cmds;
    }
}
