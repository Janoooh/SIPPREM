import { Router } from "express";
import { mostrarTiposEqPersonalControlador } from "../controllers/tipoEqPersonal.controller.js";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router();

// solo tiene el get, ya que solo es necesario ver estos datos
router.get('/', verificarTokenJWT, verificarRol(["admin","supervisor"]), mostrarTiposEqPersonalControlador);

export default router;