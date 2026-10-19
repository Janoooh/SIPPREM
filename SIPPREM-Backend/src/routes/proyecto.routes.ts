import {Router} from "express";
import {verificarTokenJWT} from "../middleware/verificarTokenJWT.js";
import {verificarRol} from "../middleware/verificarRol.js";
import {
  obtenerProyectosControlador,
  crearProyectoControlador,
  obtenerProyectoPorIdControlador,
  actualizarProyectoControlador,
  eliminarProyectoControlador
} from "../controllers/proyecto.controllers.js";

const router = Router();

router.get("/", verificarTokenJWT, verificarRol(["admin", "supervisor"]), obtenerProyectosControlador);
router.post("/", verificarTokenJWT, verificarRol(["admin", "supervisor"]), crearProyectoControlador);
router.get("/:id_proyecto", verificarTokenJWT, verificarRol(["admin", "supervisor"]), obtenerProyectoPorIdControlador);
router.put("/:id_proyecto", verificarTokenJWT, verificarRol(["admin", "supervisor"]), actualizarProyectoControlador);
router.delete("/:id_proyecto", verificarTokenJWT, verificarRol(["admin", "supervisor"]), eliminarProyectoControlador);

export default router;
