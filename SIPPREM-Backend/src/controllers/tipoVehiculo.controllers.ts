import type {Request, Response} from "express";
import * as tipoVehiculoService from "../services/tipoVehiculo.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../services/tool.errorDB.js";

export const mostrarTipoVehiculoControlador = async (req: Request, res: Response) => {
    try {
        const tipos : respuestaServices = await tipoVehiculoService.mostrarTipoVehiculo();
    
        res.status(tipos.codHTTP).json({
            ok: tipos.exito,
            message: tipos.explicacion,
            data: tipos.datos
        });

        return;

    } catch (error: any) {
        console.error("Error en controlador tipoVehiculo: ", error);
        return identificarErrorDB(error, res);
    }
};