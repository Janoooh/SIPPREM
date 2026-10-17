import type {Request, Response} from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as authServices from "../services/auth.services.js";

export const login = async (req: Request, res: Response): Promise<void> => {
    try{
        const { idIngresado, claveIngresada } = req.body;

        // Falto ingresar algun dato para el inicio de sesion.
        if (!idIngresado || !claveIngresada){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para realizar el inicio de sesion, por favor ingrese todo lo solicitado.",
                data : null
            });
            return;
        }

        const resultadoLogin : respuestaServices = await authServices.iniciarSesion(idIngresado,claveIngresada);

        res.status(resultadoLogin.codHTTP).json({
            ok: resultadoLogin.exito,
            message: resultadoLogin.explicacion,
            data : resultadoLogin.datos
        });
            
        return;


    }catch (error){
        console.error("Error en controlador login, de auth.controllers.ts : ",error);
        res.status(500).json({
            ok: false,
            message: "Error del servidor interno al procesar el inicio de sesion del usuario.",
            data : null
        });
        return;
    }
};

export const cambiarClave = async (req : Request, res : Response) : Promise<void> => {
    try{

        const {idIngresado, claveNuevaIng} = req.body

        if (!idIngresado || ! claveNuevaIng){
            res.status(400).json({
                ok: false,
                message: "Faltan datos para realizar el cambio de clave, por favor ingrese todo lo solicitado.",
                data : null
            });
            return;
        }

        const resultadoCambioClave = await authServices.cambiarClave(idIngresado,claveNuevaIng);

        res.status(resultadoCambioClave.codHTTP).json({
            ok: resultadoCambioClave.exito,
            message: resultadoCambioClave.explicacion,
            data: resultadoCambioClave.datos
        });
        return;

    }catch(error){
        console.error("Error en controlador cambiarClave, de auth.controllers.ts : ",error);
        res.status(500).json({
            ok : false,
            message : "Error del servidor interno al procesar el cambio de clave del usuario.",
            data : null
        });
        return;
    }
};