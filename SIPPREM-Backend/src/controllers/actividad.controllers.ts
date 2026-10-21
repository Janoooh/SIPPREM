import type {Request, Response} from "express";
import * as actividadService from "../services/actividad.service.js";

export const tenerActividadProyecto = async(req :Request, res: Response): Promise<void> => {
    try {
    const { id_proyecto } = req.params;
    //Validamos la entrada 
    if(!id_proyecto || isNaN(Number(id_proyecto))){
        res.status(400).json({
            ok: false,
            message: "El id del proyecto es inválido",
            data:null
        });
        return;
}
// llamada al servicio 
const resultado = await actividadService.obtenerActividadesPorProyecto(Number(id_proyecto));
// respuesta del servicio
res.status(resultado.codHTTP).json({
    ok: resultado.exito,
    message: resultado.explicacion,
    data: resultado.datos
});
return;
}catch (error) {
        // Captura de errores no controlados 
        console.error("Error en controlador tenerActividadProyecto, de actividad.controllers.ts: ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al obtener las actividades del proyecto.",
            data: null
        });
        return;
    }
};

export const crearActividadControlador = async(req :Request, res: Response): Promise<void> => {
    try {
        const { id_proyecto } = req.params;
    const { titulo, fecha, descripcion } = req.body;

    //validamos que los campos no esten vacios y que el id_proyecto sea un número
    if (!titulo || !fecha || !descripcion || !id_proyecto || isNaN(Number(id_proyecto))){
        res.status(400).json({
            ok: false,
            message: "Faltan campos obligatorios o el id del proyecto es inválido",
            data: null
        });
        return;
    }
    // llamamos al servicio 
    const resultado = await actividadService.crearActividad(
        titulo, 
        fecha, 
        descripcion, 
        Number(id_proyecto)
    );

    res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    return;
    }catch (error) {
        // Captura de errores no controlados
        console.error("Error en controlador crearActividadControlador, de actividad.controllers.ts: ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al crear la actividad.",
            data: null
        });
        return;
    }

};

export const actualizarActividadControlador = async (req: Request, res: Response): Promise<void> => {
    try{
        const { id_actividad } = req.params;
        const { titulo, fecha, descripcion } = req.body;

        // aquí validamos que la actividad exista y que los campos no estén vacíos
        if(!id_actividad || isNaN(Number(id_actividad))){
            res.status(400).json({
                ok: false,
                message: "El id de la actividad es inválido",
                data: null
            });
            return;
    }
        // verificamos que esten los campos
        if(!titulo || !fecha || !descripcion){
            res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios para actualizar la actividad(título, fecha, descripción)",
                data: null
            });
            return;
        }
        //lo mismo que en la anterior función
        const resultado = await actividadService.actualizarActividad(
            titulo,
            fecha,
            descripcion,
            Number(id_actividad)
        );

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;
    }catch (error) {
        //captura 
        console.error("Error en controlador actualizarActividadControlador, de actividad.controllers.ts: ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al actualizar la actividad.",
            data: null
        });
        return;
    }
};


export const eliminarActividadControlador = async (req: Request, res: Response): Promise<void> => {
    try{
        const { id_actividad } = req.params;

        if(!id_actividad || isNaN(Number(id_actividad))){
            res.status(400).json({
                ok: false,
                message: "El id de la actividad es inválido",
                data: null
            });
            return;
        }

        const resultado = await actividadService.eliminarActividad(Number(id_actividad));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;
    }catch (error) {

        console.error("Error en controlador eliminarActividadControlador, de actividad.controllers.ts: ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al eliminar la actividad.",
            data: null
        });
        return;
    }
}; 