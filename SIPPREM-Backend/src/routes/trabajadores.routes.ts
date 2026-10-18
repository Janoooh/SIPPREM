import {Router} from "express";
import { obtenerTrabajadoresProyectoControlador } from "../controllers/trabajadores.controllers.js";
import { asignarTrabajadorControlador } from "../controllers/trabajadores.controllers.js";
import { sacarTrabajadorControlador} from "../controllers/trabajadores.controllers.js";

const router = Router();

router.get('/proyecto/:id_proyecto', obtenerTrabajadoresProyectoControlador);
router.post("/", asignarTrabajadorControlador);
router.delete("/proyecto/:id_proyecto/usuario/:rut", sacarTrabajadorControlador);

export default router;