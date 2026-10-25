import { Router } from "express";
import { verificarRol } from "../middleware/verificarRol.js";
import {
    crearPlanificacionPatrullaje,
    obtenerPatrullajes,
    actualizarPlanificacionPatrullaje, // <-- AGREGADO: Importación del controlador PUT
    eliminarPlanificacionPatrullaje
} from "../controllers/patrullaje.controllers.js";


const router = Router({mergeParams: true});

router.get("/",verificarRol(["admin","supervisor"]), obtenerPatrullajes);
router.post("/",verificarRol(["admin","supervisor"]), crearPlanificacionPatrullaje);
router.put("/:id_patrullaje", verificarRol(["admin", "supervisor"]), actualizarPlanificacionPatrullaje);
router.delete("/:id_patrullaje", verificarRol(["admin","supervisor"]),eliminarPlanificacionPatrullaje);


export default router;