import { Router } from "express";
import {crearActividadControlador } from "../controllers/actividad.controllers.js";
import { tenerActividadProyecto } from "../controllers/actividad.controllers.js";
import { actualizarActividadControlador}from "../controllers/actividad.controllers.js"
import { eliminarActividadControlador}from "../controllers/actividad.controllers.js"

const router = Router();

// Definimos la ruta: GET /proyecto/:id_proyecto
router.get("/proyecto/:id_proyecto", tenerActividadProyecto);
router.post("/", crearActividadControlador);
router.put("/:id_actividad", actualizarActividadControlador);
router.delete("/:id_actividad",eliminarActividadControlador);

export default router;