import type {Request, Response} from "express";
import {poolDb} from "../config/db.js";
import { Query } from "pg";
import * as authServices from "../services/auth.services.js";

export const testeo = async (req : Request, res : Response) : Promise<void> => {

    const datos = await authServices.conseguirDatos();
    
    res.status(201).json({
        data: datos
    });
};