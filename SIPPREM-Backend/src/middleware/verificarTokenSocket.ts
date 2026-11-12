import type { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { poolDb } from "../config/db.js";

export const verificarTokenSocket = async (socket: Socket, next: (err?: Error) => void) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(" ")[1];

    if (!token){
        next(new Error("No se proporciono el token JWT."));
        return;
    };

    const claveSecretaJWT = process.env.JWT_SECRET as string;

    if (!claveSecretaJWT){
        console.error("La variable de entorno JWT_SECRET no esta configurada.");
        next(new Error("Error de configuracion del servidor."));
        return;
    };

    try{

        const datosUsuarioJWT = jwt.verify(token, claveSecretaJWT) as any;

        socket.data.usuario = datosUsuarioJWT;

        const queryVerificarDatosUsuario = `
            SELECT us.rut, us.nombre, us.correo, r.tipo_rol
            FROM usuario us
            INNER JOIN rol r USING (id_rol)
            WHERE us.eliminado = false AND us.rut = $1
        `;

        const resQueryVerificarDatos = await poolDb.query(queryVerificarDatosUsuario,[socket.data.usuario?.rutUsuario]);

        if (resQueryVerificarDatos.rows.length === 0){
            next(new Error("Usuario eliminado."));
            return;
        };

        if (resQueryVerificarDatos.rows[0].tipo_rol.toLowerCase() !== socket.data.usuario?.rol.toLowerCase()){
            next(new Error("Permisos modificados, por favor vuelva a iniciar sesion."));
            return;
        };

        socket.data.usuario.nombre = resQueryVerificarDatos.rows[0].nombre;

        next();

    }catch{
        next(new Error("El token entregado no es valido, o expiro."));
        return;
    }
};