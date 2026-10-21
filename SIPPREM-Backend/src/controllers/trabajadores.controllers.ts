import type { Request, Response } from "express";
import * as trabajadoresService from "../services/trabajadores.service.js";

// este es del get de trabajadores
export const obtenerTrabajadoresProyectoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_proyecto } = req.params;

        if(!id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
            ok: false,
            message: "El id del proyecto es inválido.",
            data: null
            });
            return;
        }

        const resultado = await trabajadoresService.obtenerTrabajadoresProyecto(Number(id_proyecto));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    }catch (error) {
        // 4. Captura de errores internos
        console.error("Error en controlador obtenerTrabajadoresProyectoControlador, de trabajadores.controllers.ts: ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al obtener los trabajadores del proyecto.",
            data: null
        });
        return;
    }
};


//post
// este es del post de trabajadores
// esta wea no funciona si es que el trabajador no está registrado como tal 
// Y este loquito no tiene que participar en ningún proyecto, para poder asignarlo a un proyecto 
export const asignarTrabajadorControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_proyecto } = req.params;
        const { rut } = req.body;

        // Validamos que los campos que en teoría son obligatorios estén presentes y sean del tipo correcto
        if (!rut || typeof rut !== "string" || rut.trim() === "") {
            res.status(400).json({
                ok: false,
                message: "El rut del trabajador es obligatorio y debe ser un texto válido.",
                data: null
            });
            return;
        }

        if (id_proyecto === undefined || id_proyecto === null || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "El id del proyecto es obligatorio y debe ser un número válido.",
                data: null
            });
            return;
        }


        // llamamos al servicio
        const resultado = await trabajadoresService.asignarTrabajadorProyecto(
            rut.trim(),
            Number(id_proyecto),
        );

        // la respuesta que da según el resultado devuelto por el servicio
        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error) {
        console.error("Error en asignarTrabajadorControlador, de trabajadores.controllers.ts:", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al asignar el trabajador al proyecto.",
            data: null
        });
        return;
    }
};

// Sacar a un trabajador de un proyecto(Delete)
export const sacarTrabajadorControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { rut, id_proyecto } = req.params;

        // 1. Validar que los parámetros vengan y tengan formato correcto
        if (!rut || typeof rut !== "string" || rut.trim() === "") {
            res.status(400).json({
                ok: false,
                message: "El rut del trabajador es obligatorio.",
                data: null
            });
            return;
        }

        if (!id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "El id del proyecto es obligatorio y debe ser un número válido.",
                data: null
            });
            return;
        }

        // 2. Invocar el servicio
        const resultado = await trabajadoresService.sacarTrabajadorProyecto(
            rut.trim(),
            Number(id_proyecto)
        );

        // 3. Responder con el código HTTP y datos del servicio
        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error) {
        console.error("Error en sacarTrabajadorControlador, de trabajadores.controllers.ts:", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al sacar al trabajador del proyecto.",
            data: null
        });
        return;
    }
};