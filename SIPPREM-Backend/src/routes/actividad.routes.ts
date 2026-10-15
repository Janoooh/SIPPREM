import { Router } from "express";
import {crearActividadControlador } from "../controllers/actividad.controllers.js";
import { tenerActividadProyecto } from "../controllers/actividad.controllers.js";

const router = Router();

// Definimos la ruta: GET /proyecto/:id_proyecto
router.get("/proyecto/:id_proyecto", tenerActividadProyecto);
router.post("/", crearActividadControlador);

export default router;