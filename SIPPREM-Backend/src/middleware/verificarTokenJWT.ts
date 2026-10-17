import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface RequestConUsuario extends Request{
    usuario? : {
        rutUsuario : string,
        correoUsuario : string,
        rol : string
    };
};

export const verificarTokenJWT = (req: RequestConUsuario, res : Response, next: NextFunction): void => {
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
        const datosUsuarioJWT = jwt.verify(token, claveSecretaJWT) as any;

        req.usuario = datosUsuarioJWT;
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