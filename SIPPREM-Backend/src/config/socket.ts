import {Server as SocketIOServer} from "socket.io";
import type { Server } from "http";
import type { Socket } from "socket.io";
import { verificarTokenSocket } from "../middleware/verificarTokenSocket.js";
import { registrarEventosPatrullaje } from "../sockets/patrullaje.socket.js";

export const inicializarSocket = (serverHttp: Server, origenesPermitidos: string[]) => {
    const io = new SocketIOServer(serverHttp, {
        cors: { origin: origenesPermitidos, credentials: true}
    });

    io.use(verificarTokenSocket);

    io.on("connection", (socket: Socket) => {
        registrarEventosPatrullaje(socket)
    })
};