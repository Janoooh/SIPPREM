import type { Request, Response } from "express";

/* Funcion detectarRutaNoEncontrada: Representa la respuesta que se entrega cuando
se realizo una peticion a una ruta o recurso inexistente.*/
export const detectarRutaNoEncontrada = (req: Request, res: Response): void => {
    res.status(404).json({
        ok: false,
        message: "Recurso o ruta no encontrado.",
        data: null
    });
};