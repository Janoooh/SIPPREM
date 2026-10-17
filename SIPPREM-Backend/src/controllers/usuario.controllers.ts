import type { Request, Response } from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as usuarioServices from "../services/usuario.services.js"

export const obtenerUsuarios = async (req: Request, res: Response): Promise<void> =>{
    try{
        const estado = req.query.estado as string;

        const resObtenerUsuarios = await usuarioServices.obtenerUsuarios(estado);

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