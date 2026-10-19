import type {Request, Response} from "express";
import * as EquipamientoVehiculoServices from "../services/equipamientoVehicular.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";


export const mostrarEquipamientosVehicularesControlador = async (req : Request, res: Response) =>{
    try{
        const {id_proyecto} = req.params;

        if(!id_proyecto || isNaN(Number(id_proyecto))){
            res.status(400).json({
                ok: false,
                message: "El id debe ser valido para completar la accion",
                data : null
            });
            return;
        }
        const articulosVehiculares: respuestaServices = await EquipamientoVehiculoServices.mostrarEquipamientosVehiculares(Number(id_proyecto));
        
        res.status(articulosVehiculares.codHTTP).json({
            ok: articulosVehiculares.exito,
            message: articulosVehiculares.explicacion,
            data : articulosVehiculares.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (mostrar) : ",error);
        return identificarErrorDB(error, res);  
    }
};


export const agregarEquipamientoVehicularControlador = async (req : Request, res: Response)=>{
    try{
        const {id_item, id_proyecto, id_tipo} = req.body;

        if (!id_item || !id_proyecto || isNaN(Number(id_proyecto)) || !id_tipo || isNaN(Number(id_tipo))){
            res.status(400).json({
                    ok: false,
                    message: "Faltan datos para poder completar la accion o los datos no tiene el formato correcto.",
                    data : null
                });
            return;
        }
    
        const nuevoArticuloVehicular : respuestaServices = await EquipamientoVehiculoServices.agregarEquipamientoVehicular(String(id_item), Number(id_proyecto), Number(id_tipo));
    
        res.status(nuevoArticuloVehicular.codHTTP).json({
            ok: nuevoArticuloVehicular.exito,
            message: nuevoArticuloVehicular.explicacion,
            data : nuevoArticuloVehicular.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (agregar): ",error);
        return identificarErrorDB(error, res);        
    }
   
};


export const eliminarEquipamientoVehicularControlador = async (req : Request, res: Response) => {
    try {
        const { id_eq_vehicular } = req.params;
        
        if (!id_eq_vehicular){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const eliminado : respuestaServices = await EquipamientoVehiculoServices.eliminarEquipamientoVehicular(String(id_eq_vehicular));
        
        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (eliminar) : ",error);
        return identificarErrorDB(error, res);
    }
};



/*
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
*/

/*
export const actualizarEquipamientoVehicularControlador = async (req: Request, res: Response) => {
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
*/