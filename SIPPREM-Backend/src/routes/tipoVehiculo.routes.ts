import { Router } from "express";
import { mostrarTipoVehiculoControlador } from "../controllers/tipoVehiculo.controllers.js";
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router();

// Tiene solo la ruta get, ya que son datos entregados y no cambiaran
router.get('/' , verificarRol(["admin","supervisor"]), mostrarTipoVehiculoControlador);

export default router;