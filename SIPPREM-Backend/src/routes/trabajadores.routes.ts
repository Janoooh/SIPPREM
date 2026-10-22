import {Router} from "express";
import { obtenerTrabajadoresProyectoControlador } from "../controllers/trabajadores.controllers.js";
import { asignarTrabajadorControlador } from "../controllers/trabajadores.controllers.js";
import { sacarTrabajadorControlador} from "../controllers/trabajadores.controllers.js";

const router = Router({mergeParams: true}); 

router.get('/', obtenerTrabajadoresProyectoControlador);
router.post("/", asignarTrabajadorControlador);
router.delete("/:rut", sacarTrabajadorControlador);

export default router;