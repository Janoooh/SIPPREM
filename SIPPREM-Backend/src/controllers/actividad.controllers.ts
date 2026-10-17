import type {Request, Response} from "express";
import * as actividadService from "../services/actividad.service.js";

export const tenerActividadProyecto = async(req :Request, res: Response): Promise<void> => {
    try {
    const { id_proyecto } = req.params;

    const actividades = await actividadService.obtenerActividadesPorProyecto(Number(id_proyecto));
    res.status(200).json({
        ok:true,
        message: "Actividades obtenidas exitosamente",
        data: actividades
    })
    ;}
    catch (error: any){
    res.status(500).json({
        ok:false,
        message: "Error al obtener las actividades",
        data: null,
    });
}
};

export const crearActividadControlador = async(req :Request, res: Response): Promise<void> => {
    try {
    const { titulo, fecha, descripcion, id_proyecto } = req.body;

    const nuevaActividad = await actividadService.crearActividad(
        titulo,
        fecha,
        descripcion,
        Number(id_proyecto)
    );

    res.status(201).json({
        ok: true, 
        message: "Actividad creada exitosamente",
        data: nuevaActividad
    })
    ;}
    catch (error: any){
    res.status(500).json({
        ok: false, 
        message: "Error al crear la actividad",
        data:null
    });
    }

};

export const actualizarActividadControlador = async(req :Request, res: Response): Promise<void> => {
    try {
    const {id_actividad} = req.params;
    const {titulo, fecha, descripcion} = req.body; 

    const actividadActualizada = await actividadService.actualizarActividad(
        titulo,
        fecha,
        descripcion,
        Number(id_actividad)
    );
    // esto es en caso de que no encuentre la actividad, entonces no devolvería nada
    if (!actividadActualizada){
        res.status(404).json({
            ok: false,
            message: "Actividad no encontrada",
            data:null
        });
        return;
    }
    res.status(200).json({
            ok: true,
            message: "Actividad actualizada exitosamente",
            data:actividadActualizada
        });
    }catch (error:any){
        res.status(500).json({
            ok: false,
            message: "Error al actualizar la actividad",
            data:null
        });
    }
}

export const eliminarActividadControlador = async(req :Request, res: Response): Promise<void> => {
    try {
    const {id_actividad} = req.params;

    const actividadEliminada = await actividadService.eliminarActividad( 
        Number(id_actividad)
    );
    // esto es en caso de que no encuentre la actividad a eliminar, entonces no devolvería nada
    if (!actividadEliminada){
        res.status(404).json({
            ok: false,
            message: "Actividad no encontrada para su eliminación",
            data:null
        });
        return;
    }
    res.status(200).json({
            ok: true,
            message: "Actividad eliminada exitosamente",
            data:actividadEliminada
        });
    }catch (error:any){
        res.status(500).json({
            ok: false,
            message: "Error al eliminar la actividad",
            data:null
        });
    }
}