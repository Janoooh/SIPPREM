import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as patrullajeServices from "../services/patrullaje.services.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";
import { esPoligonoValido, esRutValido } from "../utils/validadores.utils.js";

export const obtenerPatrullajes = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_proyecto = req.params.id_proyecto as string;

        const resObtenerPatrullajes = await patrullajeServices.obtenerPatrullajes(id_proyecto);

        res.status(resObtenerPatrullajes.codHTTP).json({
            ok: resObtenerPatrullajes.exito,
            message: resObtenerPatrullajes.explicacion,
            data: resObtenerPatrullajes.datos
        });

    }catch(error){
        console.log("Error en controlador obtenerPatrullaje, de patrullaje.controllers.ts : ",error);
        identificarErrorDB(error,res);
        return;
    }
};

export const crearPlanificacionPatrullaje = async (req: Request, res: Response): Promise<void> => {
    try{

        const id_proyecto = req.params.id_proyecto as string;
        const {hora_inicio, hora_termino, zona, patrulleros} = req.body;

        if (!hora_inicio || !hora_termino || !zona || !id_proyecto || !id_proyecto || !Array.isArray(patrulleros) || patrulleros.length === 0){
            res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios: hora_inicio, hora_termino, zona y al menos un patrullero son obligatorios.",
                data: null
            });
            return;
        }

        if (patrulleros.length > 2){
            res.status(400).json({
                ok: false,
                message: "Un patrullaje puede tener como máximo 2 patrulleros asignados (encargado y acompañante).",
                data: null
            });
            return;
        }

        const rutsValidos = patrulleros.every((rut: any) => typeof rut === "string" && esRutValido(rut));
        if (!rutsValidos){
            res.status(400).json({
                ok: false,
                message: "Uno o más RUTs de los patrulleros no tienen un formato válido.",
                data: null
            });
            return;
        }

        const patrullerosMinus: string[] = patrulleros.map((rut: string) => rut.toLowerCase());

        if (patrullerosMinus[0] === patrullerosMinus[1]){
            res.status(400).json({
                ok: false,
                message: "El encargado y el acompañante no pueden ser el mismo patrullero.",
                data: null
            });
            return;
        }

        if (!esPoligonoValido(zona)){
            res.status(400).json({
                ok: false,
                message: "El formato de la zona no es válido como polígono de ubicación.",
                data: null
            });
            return;
        }

        const resCrearPatrullaje: respuestaServices = await patrullajeServices.crearPlanificacionPatrullaje({
            hora_inicio: String(hora_inicio),
            hora_termino: String(hora_termino),
            zona: String(zona),
            id_proyecto: Number(id_proyecto),
            patrulleros: patrullerosMinus
        });

        res.status(resCrearPatrullaje.codHTTP).json({
            ok: resCrearPatrullaje.exito,
            message: resCrearPatrullaje.explicacion,
            data: resCrearPatrullaje.datos
        });

    }catch(error){
        console.log("Error en controlador creaPlanificacionPatrullaje, de patrullaje.controllers.ts : ",error);
        identificarErrorDB(error,res);
        return;
    }
};

export const actualizarPlanificacionPatrullaje = async (req: Request, res: Response): Promise<void> => {
    try {
        
        const id_proyecto = req.params.id_proyecto as string;
        const id_patrullaje = req.params.id_patrullaje as string;
        
        const { hora_inicio, hora_termino, zona, patrulleros } = req.body;

        if (!id_patrullaje || isNaN(Number(id_patrullaje))) {
            res.status(400).json({
                ok: false,
                message: "El ID del patrullaje debe ser un número válido.",
                data: null
            });
            return;
        }

        if (!hora_inicio || !hora_termino || !zona || !id_proyecto || !Array.isArray(patrulleros) || patrulleros.length === 0) {
            res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios: hora_inicio, hora_termino, zona y al menos un patrullero son obligatorios.",
                data: null
            });
            return;
        }

        if (patrulleros.length > 2) {
            res.status(400).json({
                ok: false,
                message: "Un patrullaje puede tener como máximo 2 patrulleros asignados (encargado y acompañante).",
                data: null
            });
            return;
        }

        const rutsValidos = patrulleros.every((rut: any) => typeof rut === "string" && esRutValido(rut));
        if (!rutsValidos) {
            res.status(400).json({
                ok: false,
                message: "Uno o más RUTs de los patrulleros no tienen un formato válido.",
                data: null
            });
            return;
        }

        const patrullerosMinus: string[] = patrulleros.map((rut: string) => rut.toLowerCase());

        if (patrullerosMinus[0] === patrullerosMinus[1]) {
            res.status(400).json({
                ok: false,
                message: "El encargado y el acompañante no pueden ser el mismo patrullero.",
                data: null
            });
            return;
        }

        if (!esPoligonoValido(zona)) {
            res.status(400).json({
                ok: false,
                message: "El formato de la zona no es válido como polígono de ubicación.",
                data: null
            });
            return;
        }

        const resActualizarPatrullaje: respuestaServices = await patrullajeServices.actualizarPlanificacionPatrullaje(
            Number(id_patrullaje),
            {
                hora_inicio: String(hora_inicio),
                hora_termino: String(hora_termino),
                zona: String(zona),
                id_proyecto: Number(id_proyecto),
                patrulleros: patrullerosMinus
            }
        );

        res.status(resActualizarPatrullaje.codHTTP).json({
            ok: resActualizarPatrullaje.exito,
            message: resActualizarPatrullaje.explicacion,
            data: resActualizarPatrullaje.datos
        });

    } catch (error) {
        console.log("Error en controlador actualizarPlanificacionPatrullaje, de patrullaje.controllers.ts : ", error);
        identificarErrorDB(error, res);
        return;
    }
};

export const eliminarPlanificacionPatrullaje = async (req: Request, res: Response): Promise<void> => {
    try{

        const id_proyecto = req.params.id_proyecto as string;
        const id_patrullaje = req.params.id_patrullaje as string;

        if (isNaN(Number(id_patrullaje))){
            res.status(400).json({
                ok: false,
                message: "El ID del patrullaje debe ser un número válido.",
                data: null
            });
            return;
        }

        const resEliminarPatrullaje: respuestaServices = await patrullajeServices.eliminarPlanificacionPatrullaje(id_proyecto,Number(id_patrullaje));
    
        res.status(resEliminarPatrullaje.codHTTP).json({
            ok: resEliminarPatrullaje.exito,
            message: resEliminarPatrullaje.explicacion,
            data: resEliminarPatrullaje.datos
        });

    }catch(error){
        console.log("Error en controlador eliminarPlanificacionPatrullaje, de patrullaje.controllers.ts : ", error);
        identificarErrorDB(error, res);
        return;
    }
};