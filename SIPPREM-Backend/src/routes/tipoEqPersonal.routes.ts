import { Router } from "express";
import { mostrarTiposEqPersonalControlador } from "../controllers/tipoEqPersonal.controller.js";

const router = Router();

router.get('/', mostrarTiposEqPersonalControlador);

export default router;