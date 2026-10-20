import { Router } from "express";
import { mostrarTiposEqVehicularControlador } from "../controllers/tipoEqVehicular.controllers.js";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router();

// get para toda la coleccion de tipos vehiculares
router.get('/' , mostrarTiposEqVehicularControlador);

export default router;