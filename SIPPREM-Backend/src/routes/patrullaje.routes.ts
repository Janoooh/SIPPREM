import { Router } from "express";
import { verificarRol } from "../middleware/verificarRol.js";
import {
    crearPlanificacionPatrullaje,
    obtenerPatrullajes,
    actualizarPlanificacionPatrullaje, // <-- AGREGADO: Importación del controlador PUT
    eliminarPlanificacionPatrullaje,
    iniciarPatrullaje, // <-- AGREGADO: Importación del controlador para iniciar patrullaje (RF06)
    finalizarPatrullaje // <-- AGREGADO: Importación del controlador para finalizar patrullaje (RF06)
} from "../controllers/patrullaje.controllers.js";


const router = Router({mergeParams: true});

router.get("/",verificarRol(["admin","supervisor"]), obtenerPatrullajes);
router.post("/",verificarRol(["admin","supervisor"]), crearPlanificacionPatrullaje);
router.put("/:id_patrullaje", verificarRol(["admin", "supervisor"]), actualizarPlanificacionPatrullaje);
router.delete("/:id_patrullaje", verificarRol(["admin","supervisor"]),eliminarPlanificacionPatrullaje);

router.post("/:id_patrullaje/iniciar", verificarRol(["patrullero"]), iniciarPatrullaje);
router.patch("/:id_patrullaje/finalizar", verificarRol(["patrullero"]), finalizarPatrullaje);


export default router;