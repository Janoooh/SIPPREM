import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as incidentesServices from "../services/incidentes.services.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";
import type { RequestConUsuario } from "../interfaces/RequestConUsuario.js";
import { esPuntoValido } from "../utils/validadores.utils.js";

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

        if (!id_proyecto || isNaN(Number(id_proyecto)) || !id_incidente || isNaN(Number(id_incidente))) {
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

export const crearIncidenteControlador = async (req: RequestConUsuario, res: Response): Promise<void> => {
    try {
        const {id_proyecto} = req.params;
        const {id_patrullaje, id_categoria_incidente, nivel_gravedad, observaciones, ubicacion, fotografias} = req.body;
        const rutUser = req.usuario?.rutUsuario || "";

        if (
            !id_proyecto || isNaN(Number(id_proyecto)) ||
            !id_patrullaje || isNaN(Number(id_patrullaje)) ||
            !id_categoria_incidente || isNaN(Number(id_categoria_incidente)) ||
            !nivel_gravedad || isNaN(Number(nivel_gravedad)) ||
            !observaciones || typeof observaciones !== "string" || observaciones.trim() === "" ||
            !ubicacion || !esPuntoValido(ubicacion)
        ) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos obligatorios para poder completar la acción o el formato es incorrecto.",
                data: null
            });
            return;
        }

        const gravedadNum = Number(nivel_gravedad);

        if (!Number.isInteger(gravedadNum) || gravedadNum < 1 || gravedadNum > 5) {
            res.status(400).json({
                ok: false,
                message: "El nivel de gravedad debe ser un número entero entre 1 y 5.",
                data: null
            });
            return;
        }

        let listaFotos: string[] = [];

        if (fotografias !== undefined && fotografias !== null) {

            if (!Array.isArray(fotografias)) {
                res.status(400).json({
                    ok: false,
                    message: "El campo fotografias debe ser un arreglo de textos Base64.",
                    data: null
                });
                return;
            }

            const todasValidas = fotografias.every(
                (foto) => typeof foto === "string" && foto.trim() !== ""
            );
            if (!todasValidas) {
                res.status(400).json({
                    ok: false,
                    message: "Todas las fotografías deben ser textos Base64 validos.",
                    data: null
                });
                return;
            }

            listaFotos = fotografias;
        }

        const nuevoIncidente = {
            id_proyecto: Number(id_proyecto),
            id_patrullaje: Number(id_patrullaje),
            id_categoria_incidente: Number(id_categoria_incidente),
            nivel_gravedad: gravedadNum,
            observaciones: observaciones.trim(),
            ubicacion: ubicacion.trim(),
            fotografias: listaFotos
        };

        const resCrearIncidente: respuestaServices = await incidentesServices.crearIncidente(nuevoIncidente, rutUser);

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
