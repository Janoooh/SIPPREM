import type { Request, Response } from "express";
import * as trabajadoresService from "../services/trabajadores.service.js";

// este es del get de trabajadores
export const obtenerTrabajadoresProyecto = async(req :Request, res: Response): Promise<void> => {
    try {
    const { id_proyecto } = req.params;

    const trabajadores = await trabajadoresService.obtenerTrabajadoresProyecto(Number(id_proyecto));
    res.status(200).json({
        ok:true,
        message: "Trabajadores obtenidos exitosamente",
        data: trabajadores
    })
    ;}
    catch (error: any){
    res.status(500).json({
        ok:false,
        message: "Error al obtener los trabajadores del proyecto",
        data: null,
    });
}
};
// este es del post de trabajadores
// esta wea no funciona si es que el trabajador no está registrado como tal 
// Y este loquito no tiene que participar en ningún proyecto.
export const asignarTrabajador = async (req: Request, res: Response): Promise<void> => {
    try {
    const {rut, id_proyecto, es_encargado} = req.body;

    const nuevoAcceso = await trabajadoresService.asignarTrabajador(
        rut,
        Number(id_proyecto),
        Boolean(es_encargado)
    );

    res.status(201).json({
        ok: true, 
        message: "Trabajador asignado exitosamente",
        data: nuevoAcceso
    })
    ;}
    catch (error: any) {
    console.error("Error en asignarTrabajador:", error);// lo agregue para no quedar varado en caso de que no funcione. 
    res.status(500).json({
    ok: false,
    message: "Error al asignar el trabajador al proyecto",
    data: null
  });
}

};