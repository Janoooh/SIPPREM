import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as incidentesServices from "../services/incidentes.services.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

export const obtenerIncidentesControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_proyecto} = req.params;

        if (!id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "El id del proyecto debe ser válido para completar la acción",
                data: null
            });
            return;
        }

        const resObtenerIncidentes: respuestaServices = await incidentesServices.obtenerIncidentes(Number(id_proyecto));

        res.status(resObtenerIncidentes.codHTTP).json({
            ok: resObtenerIncidentes.exito,
            message: resObtenerIncidentes.explicacion,
            data: resObtenerIncidentes.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador incidente (obtenerIncidentesControlador): ", error);
        identificarErrorDB(error, res);
        return;
    }
};

export const obtenerIncidentePorIdControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_proyecto, id_incidente} = req.params;

        if (!id_proyecto || isNaN(Number(id_proyecto)) || !id_incidente || String(id_incidente).trim() === "") {
            res.status(400).json({
                ok: false,
                message: "Los identificadores deben ser válidos para completar la acción",
                data: null
            });
            return;
        }

        const resObtenerIncidente: respuestaServices = await incidentesServices.obtenerIncidentePorId(Number(id_proyecto), String(id_incidente));

        res.status(resObtenerIncidente.codHTTP).json({
            ok: resObtenerIncidente.exito,
            message: resObtenerIncidente.explicacion,
            data: resObtenerIncidente.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador incidente (obtenerIncidentePorIdControlador): ", error);
        identificarErrorDB(error, res);
        return;
    }
};

export const crearIncidenteControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_proyecto} = req.params;
        const {id_patrullaje, id_categoria_incidente, nivel_gravedad, observaciones, ubicacion, fotografia} = req.body;

        if (
            !id_proyecto || isNaN(Number(id_proyecto)) ||
            !id_patrullaje || isNaN(Number(id_patrullaje)) ||
            !id_categoria_incidente || isNaN(Number(id_categoria_incidente)) ||
            !nivel_gravedad || isNaN(Number(nivel_gravedad)) ||
            !observaciones ||
            !ubicacion
        ) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos obligatorios para poder completar la acción o el formato es incorrecto.",
                data: null
            });
            return;
        }

        const gravedadNum = Number(nivel_gravedad);

        if (gravedadNum < 1 || gravedadNum > 5) {
            res.status(400).json({
                ok: false,
                message: "El nivel de gravedad debe ser un número entre 1 y 5.",
                data: null
            });
            return;
        }

        const nuevoIncidente = {
            id_proyecto: Number(id_proyecto),
            id_patrullaje: Number(id_patrullaje),
            id_categoria_incidente: Number(id_categoria_incidente),
            nivel_gravedad: gravedadNum,
            observaciones: String(observaciones),
            ubicacion: String(ubicacion),
            fotografia: fotografia ? String(fotografia) : null
        };

        const resCrearIncidente: respuestaServices = await incidentesServices.crearIncidente(nuevoIncidente);

        res.status(resCrearIncidente.codHTTP).json({
            ok: resCrearIncidente.exito,
            message: resCrearIncidente.explicacion,
            data: resCrearIncidente.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador incidente (crearIncidenteControlador): ", error);
        identificarErrorDB(error, res);
        return;
    }
};