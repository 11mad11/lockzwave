import {Socket} from "socket.io-client";
import {ControllerEmitEvents, ControllerListenEvents} from "../shared/ControllerEventsMap";

export interface State {
    menuState: MenuState,
    serverSocket?: Socket,
    controllerSocket?: Socket<ControllerEmitEvents, ControllerListenEvents>,
    url: string
}

export enum MenuState {
    Main,
    Help
}

export type ModifierByState = Partial<Record<MenuState, Modifier | Modifier[] | undefined>>;

export type Modifier = (cmds: Command[], state: State) => Promise<Command[]>

export interface Command {
    name: string,
    desc?: string,
    fn: () => Promise<void>
}
