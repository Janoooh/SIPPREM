import type {Request, Response} from "express";
import * as tipoVehiculoService from "../services/tipoVehiculo.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

// Funcion para mostrar los tipos de vehiculos que tiene el sistema
export const mostrarTipoVehiculoControlador = async (req: Request, res: Response): Promise <void> => {
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
        identificarErrorDB(error, res);
        return;
    }
};