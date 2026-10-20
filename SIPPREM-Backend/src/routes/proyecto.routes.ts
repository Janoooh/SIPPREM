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
import vehiculosRutas from "./vehiculo.routes.js"
import eqPersonalRutas from "./equipamientoPersonal.routes.js"
import eqVehicularRutas from "./equipamientoVehicular.routes.js"

const router = Router();

router.get("/", verificarTokenJWT, verificarRol(["admin", "supervisor"]), obtenerProyectosControlador);
router.post("/", verificarTokenJWT, verificarRol(["admin"]), crearProyectoControlador);
router.get("/:id_proyecto", verificarTokenJWT, verificarRol(["admin", "supervisor"]), obtenerProyectoPorIdControlador);
router.put("/:id_proyecto", verificarTokenJWT, verificarRol(["admin"]), actualizarProyectoControlador);
router.delete("/:id_proyecto", verificarTokenJWT, verificarRol(["admin"]), eliminarProyectoControlador);

router.use("/:id_proyecto/vehiculos", vehiculosRutas);
router.use("/:id_proyecto/eq_personal", eqPersonalRutas);
router.use("/:id_proyecto/eq_vehicular", eqVehicularRutas);

export default router;
