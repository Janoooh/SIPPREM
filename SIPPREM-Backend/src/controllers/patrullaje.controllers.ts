import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as patrullajeServices from "../services/patrullaje.services.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

export const obtenerPatrullajes = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_proyecto = req.params.id_proyecto as string;

        const resObtenerPatrullajes = await patrullajeServices.obtenerPatrullajes(id_proyecto);

        res.status(resObtenerPatrullajes.codHTTP).json({
            ok: resObtenerPatrullajes.exito,
            message: resObtenerPatrullajes.explicacion,
            data: resObtenerPatrullajes.datos
        });

    }catch(error){
        console.log("Error en controlador obtenerPatrullaje, de patrullaje.controllers.ts : ",error);
        identificarErrorDB(error,res);
        return;
    }
};