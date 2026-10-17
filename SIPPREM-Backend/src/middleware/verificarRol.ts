import type { Request, Response, NextFunction } from "express";
import type { RequestConUsuario } from "./verificarTokenJWT.js";

/* Esta funcion retorna otra funcion (La middleware), con la intencion de poder pasar
la lista de roles permitidos para la peticion de endpoint especifica. */
export const verificarRol = (rolesPermitidos: string[]) => {

    return (req : RequestConUsuario, res : Response, next : NextFunction): void => {
        const rolUsuario = req.usuario?.rol

        if (!rolUsuario || !rolesPermitidos.includes(rolUsuario)){
            res.status(403).json({
                ok: false,
                message: `El rol ${rolUsuario} no tiene permiso para esta accion.`,
                data: null
            });
            return;
        }
        next();
    }; 
}; 