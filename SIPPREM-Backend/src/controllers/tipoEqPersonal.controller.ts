import type {Request, Response} from "express";
import * as tipoEqPersonalService from "../services/tipoEqPersonal.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

//Funcion que sirve para ver los tipos de equipamientos personales
export const mostrarTiposEqPersonalControlador = async (req: Request, res: Response): Promise<void> => {
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
        identificarErrorDB(error, res);
        return;
    }
};