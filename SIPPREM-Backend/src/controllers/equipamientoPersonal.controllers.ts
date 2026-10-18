import type {Request, Response} from "express";
import * as equipamientoPersonalServices from "../services/equipamientoPersonal.service.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../services/tool.errorDB.js";



export const mostrarEquipamientosPersonalesControlador= async (req: Request, res: Response) =>{
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
            return identificarErrorDB(error, res);
    }
};


export const agregarEquipamientoPersonalControlador = async (req: Request, res: Response) => {
    try {
        const { id_item, id_proyecto, id_tipo, talla } = req.body;

        if (!id_item || !id_proyecto || isNaN(Number(id_proyecto)) || !id_tipo || isNaN(Number(id_tipo))) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos para poder completar la accion o los datos no tiene el formato correcto.",
                data: null
            });
            return;
        }

        const nuevoEquipamiento: respuestaServices = await equipamientoPersonalServices.agregarEquipamientoPersonal(String(id_item), Number(id_proyecto), Number(id_tipo), talla || null);

        res.status(nuevoEquipamiento.codHTTP).json({
            ok: nuevoEquipamiento.exito,
            message: nuevoEquipamiento.explicacion,
            data: nuevoEquipamiento.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoPersonal (agregar): ",error);
        return identificarErrorDB(error, res);
    }
};




export const eliminarEquipamientoPersonalControlador = async (req : Request, res: Response) => {
    try {
        const { id_eq_personal } = req.params;
    
        if (!id_eq_personal){
           res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }
    
        const eliminado:respuestaServices = await equipamientoPersonalServices.eliminarEquipamientoPersonal(String(id_eq_personal));
    
        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
        
        } catch (error: any) {
            console.error("Error en controlador equipamientoPersonal (eliminar) : ",error);
            return identificarErrorDB(error, res);
        }
};



/*
export const mostrarEquipamientoPersonalControlador = async (req:Request,  res:Response) =>{
    try{
        const {id} = req.params;

        if (!id){
            res.status(400).json({
                ok: false,
                message : "Faltan datos para completar la accion.",
                data: null
            });
            return;
        }

        const eq_personal : respuestaServices = await equipamientoPersonalServices.mostrarEquipamientoPersonal(String(id));

        res.status(eq_personal.codHTTP).json({
            ok: eq_personal.exito,
            message: eq_personal.explicacion,
            data: eq_personal.datos
        });
        return;


    }catch(error: any){
        console.error("Error en controlador vehiculo (buscarVehiculo): ",error);
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
export const actualizarEquipamientoPersonalControlador = async (req : Request, res: Response) => {
    try {
        const { id } = req.params;
        const { id_tipo, talla } = req.body;

        if (!id || !id_tipo) {
            res.status(400).json({
                ok: false,
                message: "Faltan datos obligatorios para poder completar la accion",
                data: null
            });
            return;
        }

        const equipamientoActualizado: respuestaServices = await equipamientoPersonalServices.actualizarEquipamientoPersonal(String(id), Number(id_tipo), talla || null);
        
        res.status(equipamientoActualizado.codHTTP).json({
            ok: equipamientoActualizado.exito,
            message: equipamientoActualizado.explicacion,
            data: equipamientoActualizado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador equipamientoPersonal (updateEquipamientoPersonal): ", error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data: null
        });
        return;
    }
};*/