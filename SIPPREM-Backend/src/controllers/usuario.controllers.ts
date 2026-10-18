import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as usuarioServices from "../services/usuario.services.js"
import * as validadores from "../utils/validadores.js";

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> =>{
    try{
        const estado = req.query.estado as string;

        const resObtenerUsuarios : respuestaServices= await usuarioServices.obtenerUsuarios(estado);

        res.status(resObtenerUsuarios.codHTTP).json({
            ok: resObtenerUsuarios.exito,
            message: resObtenerUsuarios.explicacion,
            data: resObtenerUsuarios.datos
        });

    }catch(error){
        console.error("Error en controlador obtenerUsuarios, de usuario.controllers.ts : ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al procesar los usuarios.",
            data : null
        });
        return;
    }
};

export const obtenerUsuario = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_user = req.params.id_user as string;

        const resObtenerUsuario : respuestaServices= await usuarioServices.obtenerUsuario(id_user);

        res.status(resObtenerUsuario.codHTTP).json({
            ok: resObtenerUsuario.exito,
            message: resObtenerUsuario.explicacion,
            data: resObtenerUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador obtenerUsuario, de usuario.controllers.ts : ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al procesar el usuarios.",
            data : null
        });
        return;
    };
};

export const crearUsuario = async (req: Request, res: Response): Promise<void> => {
    try{
        const { rut, nombre, correo, telefono, foto, id_rol } = req.body;

        if (!rut || !nombre || !correo || !id_rol){
            res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios: Rut, nombre, correo y rol son obligatorios.",
                data: null
            });
            return;
        };

        if (!validadores.esRutValido(rut)){
            res.status(400).json({
                ok: false,
                message: "El rut ingresado no es valido.",
                data: null
            });
            return;
        };

        if (!validadores.esCorreoValido(correo)){
            res.status(400).json({
                ok: false,
                message: "El correo ingresado no es valido.",
                data: null
            });
            return;
        };

        if (!validadores.esRolValido(Number(id_rol))){
            res.status(400).json({
                ok: false,
                message: "El rol ingresado no es valido.",
                data: null
            });
            return;
        };

        const userNuevo = {rut, nombre, correo, telefono, foto, id_rol};

        const resCrearUsuario : respuestaServices= await usuarioServices.crearUsuario(userNuevo);

        res.status(resCrearUsuario.codHTTP).json({
            ok: resCrearUsuario.exito,
            message: resCrearUsuario.explicacion,
            data: resCrearUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador crearUsuario, de usuario.controllers.ts : ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al crear el usuario.",
            data : null
        });
        return;
    }
};

export const eliminarUsuario = async (req: Request, res: Response) : Promise<void> => {
    try{
        const id_user = req.params.id_user as string;

        const resEliminarUsuario : respuestaServices = await usuarioServices.eliminarUsuario(id_user);

        res.status(resEliminarUsuario.codHTTP).json({
            ok: resEliminarUsuario.exito,
            message: resEliminarUsuario.explicacion,
            data: resEliminarUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador eliminarUsuario, de usuario.controllers.ts : ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al eliminar el usuario.",
            data : null
        });
        return;
    }
};