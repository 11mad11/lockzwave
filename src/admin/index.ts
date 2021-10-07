import {io, Socket} from "socket.io-client";
import Prompt from 'prompt';
import {DefaultEventsMap} from "socket.io-client/build/typed-events";

Prompt.start();

(async function () {
    const {url} = await Prompt.get([{name: "url", default: "http://localhost:3000"}])
    
    console.log("Connecting");
    const socket = io(url as string, {
        auth: {
            token: "2600"
        }
    });
    socket.on("connect", () => {
        console.log("Connected")
    });
    
    //get a list of controllers info
    socket.emit("list");
    socket.once("controllers", async (controllers: string[]) => {
        for (let i = 0; i < controllers.length; i++) {
            const controller = controllers[i];
            const cSocket = io("http://localhost:3000" + controller);
            cSocket.once("info", (...args) => {
                console.log(i, args);
                cSocket.disconnect();
            })
            cSocket.emit("info");
        }
        
        console.log("waiting 10 sec");
        await sleep(1000);
        
        const {controller} = await Prompt.get([{
            name: "controller",
            type: "integer",
            minimum: 0,
            maximum: controllers.length - 1
        }]);
        
        const cSocket = io("http://localhost:3000" + controllers[controller as number]);
        cSocket.on("info", (...args) => {
            console.log("Connected To", args);
        })
        cSocket.emit("info");
        
        await sleep(1000);
        whatToDo(cSocket);
    });
})()

async function sleep(i: number) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, i);
    })
}

async function whatToDo(cSocket: Socket) {
    while (true){
        console.log(0,"lock");
        console.log(1,"unlock");
        const {option} = await Prompt.get([{
            name:"option",
            type: "integer"
        }]);
        switch (option) {
            case 0:
                cSocket.emit("lock");
                break;
            case 1:
                cSocket.emit("unlock");
                break;
        }
    }
}
