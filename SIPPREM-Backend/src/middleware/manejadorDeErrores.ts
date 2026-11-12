import type { Request, Response, NextFunction } from "express";

/* Funcionn manejadorDeErrores: Encargada de entregar respuesta en formato establecido en
el proyecto cuando ocurren diferentes errores, como un body JSON mal formado, bloqueo por
CORS, superar el limite de datos en la peticion, u otros casos.*/
export const manejadorDeErrores = (error: any, req: Request, res: Response, next: NextFunction): void => {

    /* Error por poner un JSON mal formado en el body de la peticion. */
    if (error instanceof SyntaxError && "body" in error){
        res.status(400).json({
            ok: false,
            message: "El formato del body JSON es invalido.",
            data: null
        });
        return;
    };

    /* Bloqueo por cors, lo detectamos con el mensaje que manda el new Error de app.ts*/
    if (error.message === "Acceso bloqueado por política de CORS"){
        res.status(403).json({
            ok: false,
            message: error.message,
            data: null
        });
        return;
    };

    /* Error por superar el limite de datos establecido por peticion. */
    if (error.type === "entity.too.large"){
        res.status(413).json({
            ok: false,
            message: "El tamaño de la peticion supera el limite establecido por el sistema.",
            data: null
        });
        return;
    };

    /* Cualquier otro error no establecido. */
    res.status(500).json({
        ok: false,
        message: "Error interno del servidor.",
        data: null
    });
};