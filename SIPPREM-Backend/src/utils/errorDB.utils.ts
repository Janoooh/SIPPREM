import type { Response } from "express";

/*
Esta es una función que es muy util para reconocer los errores tipicos arrojados por la base de datos.
La idea es usarlo en el catch de los controladores para no tener un solo error generico.
*/

export const identificarErrorDB = (error: any, res: Response) => {
    switch (error.code) {
        case "P0001": // Excepciones lanzadas por nuestros triggers (RAISE EXCEPTION)
            return res.status(400).json({
                ok: false,
                message: error.message,
                data: null
            });

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
            
        case "22007": // formato de fecha/hora inválido
        case "22008": // fecha u hora fuera de rango
            return res.status(400).json({
                ok: false,
                message: "El formato de fecha u hora ingresado no es válido.",
                data: null
            });

        case "22P02": // tipo de dato inválido (ej: texto donde iba numero)
            return res.status(400).json({
                ok: false,
                message: "Uno de los datos ingresados tiene un formato o tipo inválido.",
                data: null
            });

        case "22001": // string supera el largo del varchar
            return res.status(400).json({
                ok: false,
                message: "Uno de los campos de texto excede el largo máximo permitido.",
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