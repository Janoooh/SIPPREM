import type {Request, Response} from "express";
import * as tipoEqVehicularService from "../services/tipoEqVehicular.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

// Funcion que sirve para mostrar todos los tipos de equipamientos vehiculares
export const mostrarTiposEqVehicularControlador = async (req: Request, res: Response) : Promise <void> => {
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
        identificarErrorDB(error, res);
        return;
    }
};