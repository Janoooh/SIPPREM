import type {Request, Response} from "express";
import * as equipamientoPersonalServices from "../services/equipamientoPersonal.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

// Funcion que devuelve todos los equipamientos personales de un proyecto
export const mostrarEquipamientosPersonalesControlador= async (req: Request, res: Response): Promise <void> =>{
    try {
        const {id_proyecto} = req.params;

        if(!id_proyecto || isNaN(Number(id_proyecto))){
            res.status(400).json({
                ok: false,
                message: "El id debe ser valido para completar la accion",
                data : null
            });
            return;
            
        }
        
        const equi_personales : respuestaServices = await equipamientoPersonalServices.mostrarEquipamientosPersonales(Number(id_proyecto));
            
        res.status(equi_personales.codHTTP).json({
            ok: equi_personales.exito,
            message: equi_personales.explicacion,
            data: equi_personales.datos
        });
    
        return;
    
    } catch (error: any) {
            console.error("Error en controlador equipamientoPersonal (mostrar): ",error);
            identificarErrorDB(error, res);
            return;
    }
};

// funcion para mostrar un solo equipamiento personal dado su identificador y el proyecto al que pertenece
export const mostrarUNequipamientoPersonalControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_eq_personal } = req.params;
        const { id_proyecto } = req.params;

        if (!id_eq_personal || String(id_eq_personal).trim() === "") {
            res.status(400).json({
                ok: false,
                message: "El identificador del equipamiento no es válido.",
                data: null
            });
            return;
        }

        const resultado: respuestaServices = await equipamientoPersonalServices.mostrarUNequipamientoPersonal(String(id_eq_personal).toUpperCase(), Number(id_proyecto));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoPersonal (mostrar uno): ", error);
        identificarErrorDB(error, res);
        return;
    }
};


// Funcion para agregar un equipamiento personal a un proyecto
export const agregarEquipamientoPersonalControlador = async (req: Request, res: Response) : Promise <void> => {
    try {
        const { id_proyecto } = req.params;
        const { id_item, id_tipo, talla } = req.body;

        if (!id_item || String(id_item).trim() === ""|| !id_proyecto || isNaN(Number(id_proyecto)) || !id_tipo || isNaN(Number(id_tipo)) || !talla ) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos para poder completar la accion o los datos no tiene el formato correcto.",
                data: null
            });
            return;
        }

        
        const nuevoEquipamiento: respuestaServices = await equipamientoPersonalServices.agregarEquipamientoPersonal((String(id_item)).toUpperCase(), Number(id_proyecto), Number(id_tipo), String(talla) );

        res.status(nuevoEquipamiento.codHTTP).json({
            ok: nuevoEquipamiento.exito,
            message: nuevoEquipamiento.explicacion,
            data: nuevoEquipamiento.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoPersonal (agregar): ",error);
        identificarErrorDB(error, res);
        return;
    }
};


// Para actualizar los datos lógicos de un equipamiento personal (talla o tipo)
export const actualizarEquipamientoPersonalControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_eq_personal } = req.params;
        const { id_proyecto } = req.params;
        const { id_tipo, talla } = req.body;

        if (!id_eq_personal || String(id_eq_personal).trim() === "" || !id_proyecto || isNaN(Number(id_proyecto))) {
            res.status(400).json({
                ok: false,
                message: "Los datos no son validos.",
                data: null
            });
            return;
        }

        // Asegurar que al menos se envíe un campo para actualizar
        if (id_tipo === undefined && talla === undefined) {
            res.status(400).json({
                ok: false,
                message: "Debe proporcionar al menos un campo para actualizar (tipo o talla).",
                data: null
            });
            return;
        }

        const tipoFinal = (id_tipo !== undefined && id_tipo !== null && id_tipo !== "") 
            ? Number(id_tipo) 
            : null;

        const tallaFinal = (talla !== undefined && talla !== null && String(talla).trim() !== "") 
            ? String(talla).trim() 
            : null;
        
        const resultado: respuestaServices = await equipamientoPersonalServices.actualizarEquipamientoPersonal(String(id_eq_personal).toUpperCase(),tipoFinal, tallaFinal, Number(id_proyecto));

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoPersonal (actualizar): ", error);
        identificarErrorDB(error, res);
        return;
    }
};

// Para eliminar un equipamiento personal de un proyecto
export const eliminarEquipamientoPersonalControlador = async (req : Request, res: Response): Promise <void> => {
    try {
        const { id_eq_personal } = req.params;
        const { id_proyecto } = req.params;
    
        if (!id_eq_personal || !id_proyecto){
           res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }
    
        const eliminado:respuestaServices = await equipamientoPersonalServices.eliminarEquipamientoPersonal((String(id_eq_personal)).toUpperCase(), Number(id_proyecto));
    
        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
        
        } catch (error: any) {
            console.error("Error en controlador equipamientoPersonal (eliminar) : ",error);
            identificarErrorDB(error, res);
            return;
        }
};
