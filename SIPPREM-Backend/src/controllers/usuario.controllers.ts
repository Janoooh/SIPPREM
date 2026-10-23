import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as usuarioServices from "../services/usuario.services.js"
import * as validadores from "../utils/validadores.utils.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";
import type { RequestConUsuario } from "../middleware/verificarTokenJWT.js";

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

        identificarErrorDB(error,res);
        return;
    };
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

        identificarErrorDB(error,res);
        return;
    };
};

export const obtenerProyectosDeUsuario = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_user = req.params.id_user as string;

        const resObtenerProyectosDeUsuario : respuestaServices= await usuarioServices.obtenerProyectosDeUsuario(id_user);

        res.status(resObtenerProyectosDeUsuario.codHTTP).json({
            ok: resObtenerProyectosDeUsuario.exito,
            message: resObtenerProyectosDeUsuario.explicacion,
            data: resObtenerProyectosDeUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador obtenerProyectosDeUsuario, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};

export const obtenerMiPerfil = async (req: RequestConUsuario, res: Response): Promise<void> => {
    try{
        const id_personal = req.usuario?.rutUsuario.toLowerCase() as string;

        const resObtenerMiPerfil = await usuarioServices.obtenerUsuario(id_personal);

        res.status(resObtenerMiPerfil.codHTTP).json({
            ok: resObtenerMiPerfil.exito,
            message: resObtenerMiPerfil.explicacion,
            data: resObtenerMiPerfil.datos
        });

    }catch(error){
        console.error("Error en controlador obtenerMiPerfil, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
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
                message: "El formato de rut ingresado no es valido.",
                data: null
            });
            return;
        };

        if (!validadores.esCorreoValido(correo)){
            res.status(400).json({
                ok: false,
                message: "El formato de correo ingresado no es valido.",
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

        identificarErrorDB(error,res);
        return;
    };
};

export const eliminarUsuario = async (req: RequestConUsuario, res: Response) : Promise<void> => {
    try{
        const id_user = req.params.id_user as string;
        const mi_rut = req.usuario?.rutUsuario as string;
        const mi_correo = req.usuario?.correoUsuario as string;

        if (id_user === mi_rut || id_user === mi_correo){
            res.status(400).json({
                ok: false,
                message: "No puedes eliminar tu propia cuenta de usuario.",
                data: null
            });
            return;
        };

        if (id_user === "00000000-0" || id_user === "admin@sipprem.com"){
            res.status(400).json({
                ok: false,
                message: "No puedes eliminar al administrador root.",
                data: null
            });
            return;
        };

        const resEliminarUsuario : respuestaServices = await usuarioServices.eliminarUsuario(id_user);

        res.status(resEliminarUsuario.codHTTP).json({
            ok: resEliminarUsuario.exito,
            message: resEliminarUsuario.explicacion,
            data: resEliminarUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador eliminarUsuario, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};

export const actualizarUsuario = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_user = req.params?.id_user as string;
        const {nombre,correo,telefono,foto,id_rol} = req.body;

        if (!nombre || !correo || !id_rol){
            res.status(400).json({
                ok: false,
                message: "Los campos de nombre, correo y rol no pueden quedar vacios.",
                data: null
            });
            return;
        };

        if (!validadores.esCorreoValido(correo)){
            res.status(400).json({
                ok: false,
                message: "El formato de correo ingresado no es valido.",
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

        const userModificado = {rut: id_user,nombre,correo,telefono,foto,id_rol};

        const resActualizarUsuario : respuestaServices = await usuarioServices.actualizarUsuario(userModificado);

        res.status(resActualizarUsuario.codHTTP).json({
            ok: resActualizarUsuario.exito,
            message: resActualizarUsuario.explicacion,
            data: resActualizarUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador actualizarUsuario, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};

export const reestablecerClave = async (req: Request, res: Response): Promise<void> => {
    try{
        const id_user =  req.params?.id_user as string;

        const resReestablecerClave : respuestaServices = await usuarioServices.reestablecerClave(id_user);

        res.status(resReestablecerClave.codHTTP).json({
            ok: resReestablecerClave.exito,
            message: resReestablecerClave.explicacion,
            data: resReestablecerClave.datos
        });

    }catch(error){
        console.error("Error en controlador reestablecerClave, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};

export const restaurarUsuario = async (req: Request, res: Response) : Promise<void> => {
    try{
        const id_user = req.params?.id_user as string;

        const resRestaurarUsuario : respuestaServices = await usuarioServices.restaurarUsuario(id_user);

        res.status(resRestaurarUsuario.codHTTP).json({
            ok: resRestaurarUsuario.exito,
            message: resRestaurarUsuario.explicacion,
            data: resRestaurarUsuario.datos
        });

    }catch(error){
        console.error("Error en controlador restaurarUsuario, de usuario.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};