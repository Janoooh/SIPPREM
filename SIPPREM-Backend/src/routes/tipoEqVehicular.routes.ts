import { Router } from "express";
import { mostrarTiposEqVehicularControlador } from "../controllers/tipoEqVehicular.controllers.js";
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router();

// get para toda la coleccion de tipos vehiculares
router.get('/', verificarRol(["admin","supervisor"]), mostrarTiposEqVehicularControlador);

export default router;