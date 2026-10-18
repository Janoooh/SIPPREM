import type {Request, Response} from "express";
import * as tipoEqPersonalService from "../services/tipoEqPersonal.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

export const mostrarTiposEqPersonalControlador = async (req: Request, res: Response) => {
    try {
        const tipos : respuestaServices = await tipoEqPersonalService.mostrarTiposEqPersonales();
    
        res.status(tipos.codHTTP).json({
            ok: tipos.exito,
            message: tipos.explicacion,
            data: tipos.datos
        });

        return;

    } catch (error: any) {
        console.error("Error en controlador tipoEqPersonal : ",error);
        return identificarErrorDB(error, res);
    }
};