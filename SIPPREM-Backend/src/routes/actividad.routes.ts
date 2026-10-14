import { Router } from "express";
import { tenerActividadProyecto } from "../controllers/actividad.controllers.js";

const router = Router();

// Definimos la ruta: GET /proyecto/:id_proyecto
router.get("/proyecto/:id_proyecto", tenerActividadProyecto);

export default router;