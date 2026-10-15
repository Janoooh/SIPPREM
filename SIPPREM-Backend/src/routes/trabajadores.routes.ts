import {Router} from "express";
import { obtenerTrabajadoresProyecto } from "../controllers/trabajadores.controllers.js";
import { asignarTrabajador } from "../controllers/trabajadores.controllers.js";

const router = Router();
// aun no se como funcionan estas rutas asi que lol y xd noma
router.get('/proyecto/:id_proyecto', obtenerTrabajadoresProyecto);
router.post('/', asignarTrabajador);

export default router;