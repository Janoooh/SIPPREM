import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { RequestConUsuario } from "../interfaces/RequestConUsuario.js";
import { poolDb } from "../config/db.js";

export const verificarTokenJWT = async (req: RequestConUsuario, res : Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if(!authHeader){
        res.status(401).json({
            ok: false,
            message: "Token JWT no proporcionado.",
            data: null
        });
        return;
    }

    const token = authHeader.split(" ")[1];

    if(!token){
        res.status(401).json({
            ok: false,
            message: "Token invalido",
            data: null
        });
        return;
    }

    try{
        const claveSecretaJWT = process.env.JWT_SECRET as string;

        if (!claveSecretaJWT){
            console.log("La variable de entorno JWT_SECRET no esta configurada.");
            res.status(500).json({
                ok: false,
                message: "Error de configuracion del servidor.",
                data: null
            });
            return;
        };

        const datosUsuarioJWT = jwt.verify(token, claveSecretaJWT) as any;
        req.usuario = datosUsuarioJWT;

        const queryVerificarDatosUsuario = `
            SELECT us.rut, us.correo, r.tipo_rol
            FROM usuario us
            INNER JOIN rol r USING (id_rol)
            WHERE us.eliminado = false AND us.rut = $1
        `;

        const resQueryVerificarDatos = await poolDb.query(queryVerificarDatosUsuario,[req.usuario?.rutUsuario]);

        if (resQueryVerificarDatos.rows.length === 0){
            res.status(401).json({
                ok: false,
                message: "Usuario eliminado.",
                data: null
            });
            return;
        };

        if (resQueryVerificarDatos.rows[0].tipo_rol.toLowerCase() !== req.usuario?.rol.toLowerCase()){
            res.status(401).json({
                ok: false,
                message: "Permisos modificados, por favor vuelva a iniciar sesion.",
                data: null
            });
            return;
        }

        next();
    }catch{
        res.status(401).json({
            ok: false,
            message: "Token invalido o expirado.",
            data: null
        });
        return;
    }
}