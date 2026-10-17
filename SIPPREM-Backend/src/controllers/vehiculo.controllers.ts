import type {Request, Response} from "express";
import {poolDb} from "../config/db.js";
import { Query } from "pg";
import * as vehiculoServices from "../services/vehiculo.services.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

//para mostrar todos los vehiculos en la base de datos
export const mostrarVehiculos = async (req: Request, res: Response) => {
    try {
        const vehiculos : respuestaServices = await vehiculoServices.verVehiculos();
        
        res.status(vehiculos.codHTTP).json({
            ok: vehiculos.exito,
            message: vehiculos.explicacion,
            data: vehiculos.datos
        });

        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (mostrarVehiculo): ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;
    }
};

//para mostrar un vehiculo dado una patente
export const buscarVehiculo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        //esto se supone que se ve en el frontend
        if (!id){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const vehiculo: respuestaServices = await vehiculoServices.verVehiculoID(String(id));

        res.status(vehiculo.codHTTP).json({
            ok: vehiculo.exito,
            message: vehiculo.explicacion,
            data: vehiculo.datos
        });
        
        return;


    } catch (error: any) {
        console.error("Error en controlador vehiculo (buscarVehiculo): ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;
    }
};

//para agregar un vehiculo
export const addVehiculo = async (req: Request, res: Response) => {
    try {
        const {id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo} = req.body;

        //si alguno de los campos viene vacio
        if (!id_item || !id_proyecto || !nombre_vehiculo|| !id_tipo_vehiculo){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para poder completar la accion",
                data : null
            });
            return;
        }

        const nuevoVehiculo: respuestaServices = await vehiculoServices.agregarVehiculo(id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo);

        res.status(nuevoVehiculo.codHTTP).json({
            ok: nuevoVehiculo.exito,
            message: nuevoVehiculo.explicacion,
            data : nuevoVehiculo.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (addVehiculo): ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;
    }
};


//para eliminar un vehiculo
export const eliminarVehiculo = async (req: Request, res: Response) => {
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

        const eliminado:respuestaServices = await vehiculoServices.borrarVehiculo(String(id));

        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador vehiculo (eliminarVehiculo): ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor al procesar la consulta",
            data : null
        });
        return;
    }
};