import { Router } from "express";
import { mostrarTiposEqVehicularControlador } from "../controllers/tipoEqVehicular.controllers.js";

const router = Router();

router.get('/', mostrarTiposEqVehicularControlador);

export default router;