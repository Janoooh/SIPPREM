import { Router } from "express";
import { mostrarTipoVehiculoControlador } from "../controllers/tipoVehiculo.controllers.js";

const router = Router();

router.get('/', mostrarTipoVehiculoControlador);

export default router;