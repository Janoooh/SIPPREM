import type {Request, Response} from "express";
import * as actividadService from "../services/actividad.service.js";

export const tenerActividadProyecto = async(req :Request, res: Response): Promise<void> => {
    try {
    const { id_proyecto } = req.params;

    const actividades = await actividadService.obtenerActividadesPorProyecto(Number(id_proyecto));
    res.status(200).json(actividades);}
    catch (error: any){
    res.status(500).json({
        mensaje: "Error al obtener las actividades",
        error: error.message,
    });
    }
};