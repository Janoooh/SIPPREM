import type { Request, Response, NextFunction} from "express";

const regexDetectorXSS = /<[^>]*>|javascript:/i;

const contieneXSS = (datos: any): boolean => {
    
    if(typeof datos === "string"){
        return regexDetectorXSS.test(datos);
    };

    if(Array.isArray(datos)){
        return datos.some( (dato) => contieneXSS(dato) );
    };
    
    if(datos !== null && typeof datos === "object"){
        return Object.values(datos).some( (dato) => contieneXSS(dato) );
    };

    return false;
};

export const prevenirXSS = (req: Request, res: Response, next: NextFunction) : void => {
    if (req.body && contieneXSS(req.body)){
        res.status(400).json({
            ok: false,
            message: "Los datos enviados tienen etiquetas HTML o scripts, los cuales no son aceptados.",
            data: null
        });
        return;
    };

    next();
};