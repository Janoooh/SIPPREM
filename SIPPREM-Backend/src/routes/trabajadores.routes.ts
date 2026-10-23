import {Router} from "express";
import { obtenerTrabajadoresProyectoControlador } from "../controllers/trabajadores.controllers.js";
import { asignarTrabajadorControlador } from "../controllers/trabajadores.controllers.js";
import { sacarTrabajadorControlador} from "../controllers/trabajadores.controllers.js";
import { verificarRol } from "../middleware/verificarRol.js";

const router = Router({mergeParams: true}); 

router.get('/', verificarRol(["admin","supervisor"]), obtenerTrabajadoresProyectoControlador);
router.post("/", verificarRol(["admin","supervisor"]), asignarTrabajadorControlador);
router.delete("/:rut", verificarRol(["admin","supervisor"]), sacarTrabajadorControlador);

export default router;