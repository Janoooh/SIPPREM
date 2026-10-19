import type {Request, Response} from "express";
import * as vehiculoServices from "../services/vehiculo.services.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

//para mostrar todos los vehiculos en la base de datos
export const mostrarVehiculosControlador = async (req: Request, res: Response) => {
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

        const vehiculos : respuestaServices = await vehiculoServices.mostrarVehiculos(Number(id_proyecto));
    
        res.status(vehiculos.codHTTP).json({
            ok: vehiculos.exito,
            message: vehiculos.explicacion,
            data: vehiculos.datos
        });

        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (mostrarVehiculo): ",error);
        return identificarErrorDB(error, res);
    }
};

//para agregar un vehiculo
export const agregarVehiculoControlador = async (req: Request, res: Response) => {
    try {
        const {id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo} = req.body;

        //si alguno de los campos viene vacio
        if (!id_item || !id_proyecto || isNaN(Number(id_proyecto)) || !nombre_vehiculo|| !id_tipo_vehiculo || isNaN(Number(id_tipo_vehiculo))){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para poder completar la accion",
                data : null
            });
            return;
        }

        const nuevoVehiculo: respuestaServices = await vehiculoServices.agregarVehiculo(String(id_item), Number(id_proyecto), String(nombre_vehiculo), Number(id_tipo_vehiculo));

        res.status(nuevoVehiculo.codHTTP).json({
            ok: nuevoVehiculo.exito,
            message: nuevoVehiculo.explicacion,
            data : nuevoVehiculo.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (agregarVehiculo): ",error);
        return identificarErrorDB(error, res);
    }
};


//para eliminar un vehiculo
export const eliminarVehiculoControlador = async (req: Request, res: Response) => {
    try {
        const { id_vehiculo } = req.params;

        if (!id_vehiculo){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const eliminado:respuestaServices = await vehiculoServices.eliminarVehiculo(String(id_vehiculo));

        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador vehiculo (eliminarVehiculo): ",error);
        return identificarErrorDB(error, res);
    }
};