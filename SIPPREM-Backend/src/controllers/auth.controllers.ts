import type {Request, Response} from "express";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import * as authServices from "../services/auth.services.js";
import { esClaveValida } from "../utils/validadores.utils.js";
import { identificarErrorDB } from "../utils/errorDB.utils.js";

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

        identificarErrorDB(error, res);
        return;
    };
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
        };

        if(!esClaveValida(claveNuevaIng)){
            res.status(400).json({
                ok: false,
                message: "La clave no es valida, debe tener al menos 8 caracteres.",
                data : null
            });
            return;
        };

        const resultadoCambioClave : respuestaServices = await authServices.cambiarClave(idIngresado,claveNuevaIng);

        res.status(resultadoCambioClave.codHTTP).json({
            ok: resultadoCambioClave.exito,
            message: resultadoCambioClave.explicacion,
            data: resultadoCambioClave.datos
        });
        return;

    }catch(error){
        console.error("Error en controlador cambiarClave, de auth.controllers.ts : ",error);

        identificarErrorDB(error,res);
        return;
    };
};