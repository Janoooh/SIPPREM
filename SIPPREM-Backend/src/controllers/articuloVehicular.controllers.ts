import type {Request, Response} from "express";
import {poolDb} from "../config/db.js";
import { Query } from "pg";
import * as articuloVehiculoServices from "../services/articuloVehicular.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";


export const mostrarArticulosVehiculares = async (req : Request, res: Response) =>{
    try{
        const articulosVehiculares: respuestaServices = await articuloVehiculoServices.verArticulosVehiculares();
        
        res.status(articulosVehiculares.codHTTP).json({
            ok: articulosVehiculares.exito,
            message: articulosVehiculares.explicacion,
            data : articulosVehiculares.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador articuloVehicular (mostrarArticuloVehicular): ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;    
    }
};

export const mostrarArticuloVehicular = async (req : Request, res: Response) =>{
    try{
        const { id } = req.params;
        
        if (!id){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const articuloVehicular : respuestaServices = await articuloVehiculoServices.verArticuloVehicular(String(id));
    
        res.status(articuloVehicular.codHTTP).json({
            ok: articuloVehicular.exito,
            message: articuloVehicular.explicacion,
            data : articuloVehicular.datos
        });
        return;
    
        } catch (error: any) {
            console.error("Error en controlador articuloVehicular (mostrarArticuloVehicular)",error);
            res.status(500).json({
                ok: false,
                message: "Error del servidor al procesar la consulta",
                data : null
            });
            return;
        }
   
};

export const addArticuloVehicular = async (req : Request, res: Response)=>{
    try{
        const {id_item, id_proyecto, id_tipo} = req.body;

        if (!id_item || !id_proyecto || !id_tipo){
            res.status(400).json({
                    ok: false,
                    message: "Faltan datos para poder completar la accion",
                    data : null
                });
            return;
        }
    
        const nuevoArticuloVehicular : respuestaServices = await articuloVehiculoServices.agregarArticuloVehicular(id_item, id_proyecto, id_tipo);
    
        res.status(nuevoArticuloVehicular.codHTTP).json({
            ok: nuevoArticuloVehicular.exito,
            message: nuevoArticuloVehicular.explicacion,
            data : nuevoArticuloVehicular.datos
        });
        return;
    
    } catch (error: any) {
            console.error("Error en controlador articuloVehicular (addArticuloVehicular): ",error);
            res.status(500).json({
                ok: false,
                message: "Error del servidor al procesar la consulta",
                data : null
            });
            return;
        }
   
};

export const actualizarArticuloVehicular = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { id_tipo, id_vehiculo } = req.body;

        if (!id || !id_tipo) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos obligatorios para poder completar la accion",
                data: null
            });
            return;
        }

        // Si id_vehiculo viene vacio se deja como null
        const vehiculoAsignado = id_vehiculo || null;

        const articuloActualizado: respuestaServices = await articuloVehiculoServices.editarArticuloVehicular(String(id), Number(id_tipo), vehiculoAsignado);

        res.status(articuloActualizado.codHTTP).json({
            ok: articuloActualizado.exito,
            message: articuloActualizado.explicacion,
            data: articuloActualizado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador articuloVehicular (updateArticuloVehicular): ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data: null
        });
        return;
    }
};

export const eliminarArticuloVehicular = async (req : Request, res: Response) => {
    try {
        const { id } = req.params;
        
        if (!id){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const eliminado : respuestaServices = await articuloVehiculoServices.borrarArticuloVehicular(String(id));
        
        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador articuloVehicular (eliminarArticuloVehicular):",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;
    }
};