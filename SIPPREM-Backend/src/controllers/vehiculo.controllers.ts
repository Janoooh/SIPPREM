import type {Request, Response} from "express";
import * as vehiculoServices from "../services/vehiculo.services.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

//para mostrar todos los vehiculos dado un id de proyecto
export const mostrarVehiculosControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_proyecto} = req.params;
        
        // entra aqui si el id es null, undefined o si el id no es un tipo de dato numerico
        if(!id_proyecto || isNaN(Number(id_proyecto))){
            res.status(400).json({
                ok: false,
                message: "El id debe ser valido para completar la accion",
                data : null
            });
            return;
        }

        // se llama a la funcion que hace la consulta a la base de datos. 
        const vehiculos : respuestaServices = await vehiculoServices.mostrarVehiculos(Number(id_proyecto));
        
        // Se retorna la respuesta 
        res.status(vehiculos.codHTTP).json({
            ok: vehiculos.exito,
            message: vehiculos.explicacion,
            data: vehiculos.datos
        });

        return;

    } catch (error: any) {
        // En caso de error se captura aqui. Se manda un mensaje por consola indicando en que archivo fallo
        // Llama a la funcion para que la repuesta sea más clara.
        console.error("Error en controlador vehiculo (mostrarVehiculo): ",error);
        identificarErrorDB(error, res);
        return;
    }
};


export const mostrarUNvehiculoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_vehiculo} = req.params;
        const {id_proyecto} = req.params;
        
        // entra aqui si el id es null, undefined o si el id no es un tipo de dato numerico
        if(!id_proyecto || isNaN(Number(id_proyecto)) || !id_vehiculo || String(id_vehiculo).trim() === ""){
            res.status(400).json({
                ok: false,
                message: "El id debe ser valido para completar la accion",
                data : null
            });
            return;
        }

        // se llama a la funcion que hace la consulta a la base de datos. 
        const vehiculos : respuestaServices = await vehiculoServices.mostrarUNvehiculo(String(id_vehiculo), Number(id_proyecto));
        
        // Se retorna la respuesta 
        res.status(vehiculos.codHTTP).json({
            ok: vehiculos.exito,
            message: vehiculos.explicacion,
            data: vehiculos.datos
        });

        return;

    } catch (error: any) {
        // En caso de error se captura aqui. Se manda un mensaje por consola indicando en que archivo fallo
        // Llama a la funcion para que la repuesta sea más clara.
        console.error("Error en controlador vehiculo (mostrarVehiculo): ",error);
        identificarErrorDB(error, res);
        return;
    }
};

//para agregar un vehiculo
export const agregarVehiculoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id_proyecto} = req.params;
        const {id_item, nombre_vehiculo, id_tipo_vehiculo} = req.body;

        //si alguno de los campos viene vacio o no tiene el tipo de dato necesitado
        if (!id_item || !id_proyecto || isNaN(Number(id_proyecto)) || !nombre_vehiculo|| !id_tipo_vehiculo || isNaN(Number(id_tipo_vehiculo))){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para poder completar la accion o el formato de los datos es incorrecto.",
                data : null
            });
            return;
        }

        const nuevoVehiculo: respuestaServices = await vehiculoServices.agregarVehiculo((String(id_item)).toUpperCase(), Number(id_proyecto), String(nombre_vehiculo), Number(id_tipo_vehiculo));

        res.status(nuevoVehiculo.codHTTP).json({
            ok: nuevoVehiculo.exito,
            message: nuevoVehiculo.explicacion,
            data : nuevoVehiculo.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (agregarVehiculo): ",error);
        identificarErrorDB(error, res);
        return;
    }
};

export const actualizarVehiculoControlador = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id_vehiculo } = req.params;
        const { id_proyecto } = req.params;
        const { nombre_vehiculo, id_tipo_vehiculo } = req.body;

        // Validar que el id no sea null o undefined
        if (!id_vehiculo || String(id_proyecto).trim() === "") {
            res.status(400).json({
                ok: false,
                message: "Se requiere el id del vehículo para actualizar.",
                data: null
            });
            return;
        }

        // Validar que al menos uno de los campos a actualizar esté presente
        if (!nombre_vehiculo && !id_tipo_vehiculo && !id_proyecto) {
            res.status(400).json({
                ok: false,
                message: "Debe enviar al menos un campo para actualizar.",
                data: null
            });
            return;
        }
        
        // Validaciones para que los datos se vayan como null o como un dato correcto
        const nombreFinal = (nombre_vehiculo && nombre_vehiculo.trim() !== "") ? nombre_vehiculo : null;
        const tipoVehiculoFinal = id_tipo_vehiculo ? Number(id_tipo_vehiculo) : null;
        const proyectoFinal = id_proyecto ? Number(id_proyecto) : null;

        const resultado: respuestaServices = await vehiculoServices.actualizarVehiculo(String(id_vehiculo), nombreFinal, tipoVehiculoFinal, proyectoFinal);

        res.status(resultado.codHTTP).json({
            ok: resultado.exito,
            message: resultado.explicacion,
            data: resultado.datos
        });
        return;

    } catch (error: any) {
        console.error("Error en controlador vehiculo (ActualizarVehiculo): ",error);
        identificarErrorDB(error, res);
        return;
    }
};


//para eliminar un vehiculo
export const eliminarVehiculoControlador = async (req: Request, res: Response): Promise<void> =>  {
    try {
        const { id_proyecto } = req.params;
        const { id_vehiculo } = req.params;
        
        //solo pregunta si el id es null o undefined
        if (!id_vehiculo || !id_proyecto){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para completar la accion",
                data : null
            });
            return;
        }

        const eliminado:respuestaServices = await vehiculoServices.eliminarVehiculo((String(id_vehiculo)).toUpperCase(), Number(id_proyecto));

        res.status(eliminado.codHTTP).json({
            ok: eliminado.exito,
            message: eliminado.explicacion,
            data : eliminado.datos
        });
        return;
    
    } catch (error: any) {
        console.error("Error en controlador vehiculo (eliminarVehiculo): ",error);
        identificarErrorDB(error, res);
        return;
    }
};