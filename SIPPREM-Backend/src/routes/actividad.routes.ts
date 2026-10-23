import { Router } from "express";
import {crearActividadControlador } from "../controllers/actividad.controllers.js";
import { tenerActividadProyecto } from "../controllers/actividad.controllers.js";
import { actualizarActividadControlador}from "../controllers/actividad.controllers.js"
import { eliminarActividadControlador}from "../controllers/actividad.controllers.js"
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router({mergeParams: true}); 

// Definimos la ruta: GET /proyecto/:id_proyecto
router.get("/", verificarRol(["admin","supervisor"]), tenerActividadProyecto);
router.post("/", verificarRol(["admin","supervisor"]), crearActividadControlador);
router.put("/:id_actividad", verificarRol(["admin","supervisor"]), actualizarActividadControlador);
router.delete("/:id_actividad", verificarRol(["admin","supervisor"]), eliminarActividadControlador);

export default router;