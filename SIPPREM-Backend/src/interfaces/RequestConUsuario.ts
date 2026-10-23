import type { Request } from "express";

export interface RequestConUsuario extends Request{
    usuario? : {
        rutUsuario : string,
        correoUsuario : string,
        rol : string
    };
};