import Express from 'express';
import * as http from "http";
import {Server,Socket} from 'socket.io';

const app = Express();
const index = http.createServer(app);
const io = new Server(index,{
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

function initAdminIO(socket: Socket) {
    socket.on("list",()=>{
        socket.emit("controllers", [...(io.sockets.adapter.rooms.get('controller')||[])].map(c=>"/controller/"+c));
    });
}

function initControllerIO(socket: Socket) {
    const controllerNS = io.of('/controller/'+socket.id);
    
    socket.once("disconnect",()=>{
        controllerNS.disconnectSockets();
        controllerNS.removeAllListeners();
    });
    
    controllerNS.on("connect",socket1 => {
        socket1.onAny((eventName, ...args)=>{
            socket.emit(eventName,...args);
        });
    });
    socket.onAny((eventName, ...args)=>{
        controllerNS.emit(eventName,...args);
    })
}

io.on('connection', (socket) => {
    const token = socket.handshake.auth.token;
    
    if(token===(process.env.PASSWORD || "2600")){
        socket.join('admin');
        initAdminIO(socket);
    }else {
        socket.join('controller');
        initControllerIO(socket);
    }
});


index.listen(3000);
