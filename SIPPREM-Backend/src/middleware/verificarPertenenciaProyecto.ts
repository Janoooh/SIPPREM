import type { Request, Response, NextFunction } from "express";
import type { RequestConUsuario } from "../interfaces/RequestConUsuario.js";
import { poolDb } from "../config/db.js";

export const verificarPertenenciaProyecto = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try{
        const rol = req.usuario?.rol;
        const id_user = req.usuario?.rutUsuario;
        const {id_proyecto} = req.params;

        if (rol?.toLowerCase() === "admin"){
            next();
            return;
        }

        const queryVerificarPertenenciaProyecto = `
            SELECT rut, id_proyecto
            FROM acceso_proyecto
            WHERE rut = $1 AND id_proyecto = $2
        `;

        const resVerificacion = await poolDb.query(queryVerificarPertenenciaProyecto,[id_user,id_proyecto]);

        if(resVerificacion.rows.length === 0){
            res.status(403).json({
                ok: false,
                message: "No tienes acceso a este proyecto.",
                data: null
            });
            return;
        }
        
        next();

    }catch(error: any){
        res.status(400).json({
            ok: false,
            message: "Ocurrio un error en el servidor al validar permisos para proyecto.",
            data: null
        });
        return;
    };
};