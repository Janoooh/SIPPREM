import type {Request, Response} from "express";
import {poolDb} from "../config/db.js";
import { Query } from "pg";
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

        const resultadoLogin = await authServices.iniciarSesion(idIngresado,claveIngresada);

        // Las credenciales que ingresaron no corresponden a las correctas del usuario.
        if (!resultadoLogin){
            res.status(400).json({
                ok: false,
                message: "Las credenciales ingresadas son incorrectas.",
                data : null
            });
            return;
        }

        // El inicio de sesion se realizo correctamente.
        res.status(200).json({
            ok : true,
            message: "Inicio de sesion exitoso.",
            data : resultadoLogin
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