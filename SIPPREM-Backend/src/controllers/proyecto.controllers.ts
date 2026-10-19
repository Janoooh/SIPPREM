import type { Request, Response } from "express";
import * as proyectoServices from "../services/proyecto.services.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Obtener todos los proyectos
export const obtenerProyectosControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const resultado: respuestaServices = await proyectoServices.obtenerProyectos();

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    } catch (error) {
        console.error("Error en controlador obtenerProyectosControlador, de proyecto.controllers.ts : ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al procesar los proyectos.",
            data: null
        });
        return;
    }
};

// Obtener un proyecto específico por ID
export const obtenerProyectoPorIdControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                ok: false,
                message: "El ID debe ser válido para completar la acción",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await proyectoServices.obtenerProyectoPorId(Number(id));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    } catch (error) {
        console.error("Error en controlador obtenerProyectoPorIdControlador, de proyecto.controllers.ts : ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al procesar el proyecto.",
            data: null
        });
        return;
    }
};

// Crear un nuevo proyecto
export const crearProyectoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, zona_seleccionada } = req.body;

        // Validamos que vengan todos los campos obligatorios según la BD
        if (!nombre_proyecto || !nombre_sector || !presupuesto || !fecha_inicio || !fecha_termino || !zona_seleccionada) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos obligatorios para poder crear el proyecto",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await proyectoServices.crearProyecto(
            String(nombre_proyecto),
            String(nombre_sector),
            Number(presupuesto),
            fecha_inicio,
            fecha_termino,
            zona_seleccionada
        );

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    } catch (error) {
        console.error("Error en controlador crearProyectoControlador, de proyecto.controllers.ts : ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al crear el proyecto.",
            data: null
        });
        return;
    }
};

// Actualizar un proyecto
export const actualizarProyectoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, zona_seleccionada, activo } = req.body;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                ok: false,
                message: "El ID debe ser válido para completar la acción",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await proyectoServices.actualizarProyecto(
            Number(id),
            nombre_proyecto,
            nombre_sector,
            presupuesto ? Number(presupuesto) : undefined,
            fecha_inicio,
            fecha_termino,
            zona_seleccionada,
            activo
        );

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    } catch (error) {
        console.error("Error en controlador actualizarProyectoControlador, de proyecto.controllers.ts : ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al actualizar el proyecto.",
            data: null
        });
        return;
    }
};

// Eliminar un proyecto
export const eliminarProyectoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la acción",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await proyectoServices.eliminarProyecto(Number(id));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
    } catch (error) {
        console.error("Error en controlador eliminarProyectoControlador, de proyecto.controllers.ts : ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al eliminar el proyecto.",
            data: null
        });
        return;
    }
};