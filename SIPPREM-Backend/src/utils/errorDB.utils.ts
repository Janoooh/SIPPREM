import type { Response } from "express";

export const identificarErrorDB = (error: any, res: Response) => {
    switch (error.code) {
        case "23505": // error de duplicado
            return res.status(409).json({
                ok: false,
                message: "El registro ya existe o hay un dato duplicado.",
                data: null
            });

        case "23503": // FK violation
            return res.status(400).json({
                ok: false,
                message: "El recurso al que debería estar relacionado no existe en la base de datos.",
                data: null
            });

        case "23502": // falta campo obligatorio
            return res.status(400).json({
                ok: false,
                message: "Falta un campo obligatorio requerido por la base de datos.",
                data: null
            });

        case "23514": // violación de un check
            return res.status(400).json({
                ok: false,
                message: "Los datos ingresados no cumplen con las validaciones.",
                data: null
            });

        default:
            // Error genérico de servidor para cualquier otra cosa inesperada
            return res.status(500).json({
                ok: false,
                message: "Error del servidor al procesar la consulta.",
                data: null
            });
    }
};