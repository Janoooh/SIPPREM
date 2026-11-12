import type { Request, Response, NextFunction } from "express";
import type { RequestConUsuario } from "../interfaces/RequestConUsuario.js";
import { poolDb } from "../config/db.js";

export const verificarPertenenciaProyecto = async (req: RequestConUsuario, res: Response, next: NextFunction): Promise<void> => {
    try{
        const rol = req.usuario?.rol;
        const id_user = req.usuario?.rutUsuario;
        const {id_proyecto} = req.params;

        if (!id_proyecto || isNaN(Number(id_proyecto))){
            res.status(400).json({
                ok: false,
                message: `La id del proyecto debe ser un numero.`,
                data: null
            });
            return;
        }

        const queryVerificarProyecto = `
            SELECT id_proyecto
            FROM proyecto_patrullaje
            WHERE id_proyecto = $1 AND eliminado = false
        `;

        const resQueryVerificarProyecto = await poolDb.query(queryVerificarProyecto,[id_proyecto]);

        if (resQueryVerificarProyecto.rows.length === 0){
            res.status(404).json({
                ok: false,
                message: `El proyecto con id ${id_proyecto} no se encontro.`,
                data: null
            });
            return;
        }

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