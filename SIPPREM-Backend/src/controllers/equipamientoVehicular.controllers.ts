import type {Request, Response} from "express";
import * as EquipamientoVehiculoServices from "../services/equipamientoVehicular.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

// PAra mostrar todos los equipamientos vehiculares de un proyecto
export const mostrarEquipamientosVehicularesControlador = async (req : Request, res: Response) : Promise <void> =>{
    try{
        const {id_proyecto} = req.params;
        
        // verifica que tenga el parametro del proyecto y que el dato sea numerico
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
        identificarErrorDB(error, res);
        return;
    }
};


// Para consultar un único equipamiento vehicular por su id
export const mostrarUNequipamientoVehicularControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_eq_vehicular } = req.params;
        const { id_proyecto } = req.params;
        
        //verifica que el request tenga el id del vehiculo y el id del proyecto y que ambos esten en el formato solicitado
        if (!id_eq_vehicular || String(id_eq_vehicular).trim() === "" || !id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "Datos no validos.",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await EquipamientoVehiculoServices.mostrarUNequipamientoVehicular(String(id_eq_vehicular).toUpperCase(), Number(id_proyecto));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (mostrar uno): ", error);
        identificarErrorDB(error, res);
        return;
    }
};



// Para agregar un equipamiento vehicular a un proyecto
export const agregarEquipamientoVehicularControlador = async (req : Request, res: Response): Promise <void> => {
    try{
        const {id_proyecto} = req.params;
        const {id_item, id_tipo, id_vehiculo} = req.body;

        if (!id_item || !id_proyecto || isNaN(Number(id_proyecto)) || !id_tipo || isNaN(Number(id_tipo)) || !id_vehiculo){
            res.status(400).json({
                    ok: false,
                    message: "Faltan datos para poder completar la accion o los datos no tiene el formato correcto.",
                    data : null
                });
            return;
        }
    
        const nuevoArticuloVehicular : respuestaServices = await EquipamientoVehiculoServices.agregarEquipamientoVehicular((String(id_item)).toUpperCase(), Number(id_proyecto), Number(id_tipo), String(id_vehiculo));
    
        res.status(nuevoArticuloVehicular.codHTTP).json({
            ok: nuevoArticuloVehicular.exito,
            message: nuevoArticuloVehicular.explicacion,
            data : nuevoArticuloVehicular.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (agregar): ",error);
        identificarErrorDB(error, res);        
        return;
    }
   
};


// Para actualizar los datos de un equipamiento vehicular (ej. actualizar tipo de equipamiento o reasignar vehículo/proyecto si aplica)
export const actualizarEquipamientoVehicularControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_proyecto } = req.params;
        const { id_eq_vehicular } = req.params;
        const { id_tipo} = req.body;

        if (!id_eq_vehicular || String(id_eq_vehicular).trim() === "" || !id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "Los datos no son validos.",
                data: null
            });
            return;
        }

        // Si no se envía o viene vacío/inválido, se convierte explícitamente en null.
        const idTipoFinal = (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") 
            ? Number(id_tipo) 
            : null;


        // Validación: Debe proporcionarse al menos un campo a actualizar
        if (idTipoFinal === null) {
            res.status(400).json({
                ok: false,
                message: "Debe proporcionar al menos un campo válido para actualizar.",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await EquipamientoVehiculoServices.actualizarEquipamientoVehicular(String(id_eq_vehicular).toUpperCase(),idTipoFinal, Number(id_proyecto));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (actualizar): ", error);
        identificarErrorDB(error, res);
        return;
    }
};

//para eliminar un equipamiento vehicular de un proyecto
export const eliminarEquipamientoVehicularControlador = async (req : Request, res: Response): Promise <void> => {
    try {
        const { id_eq_vehicular } = req.params;
        const { id_proyecto } = req.params;
        
        if (!id_eq_vehicular || !id_proyecto){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const eliminado : respuestaServices = await EquipamientoVehiculoServices.eliminarEquipamientoVehicular((String(id_eq_vehicular)).toUpperCase(), Number(id_proyecto));
        
        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador equipamientoVehicular (eliminar) : ",error);
        identificarErrorDB(error, res);
        return;
    }
};

