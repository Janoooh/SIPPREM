import type {Request, Response} from "express";
import * as tipoEqVehicularService from "../services/tipoEqVehicular.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../services/tool.errorDB.js";

export const mostrarTiposEqVehicularControlador = async (req: Request, res: Response) => {
    try {
        const tipos : respuestaServices = await tipoEqVehicularService.mostrarTiposEqVehiculares();
    
        res.status(tipos.codHTTP).json({
            ok: tipos.exito,
            message: tipos.explicacion,
            data: tipos.datos
        });

        return;

    } catch (error: any) {
        console.error("Error en controlador tipoEqVehicular: ",error);
        return identificarErrorDB(error, res);
    }
};