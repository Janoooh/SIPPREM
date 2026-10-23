import {Router} from "express";
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
import trabajadoresRutas from "./trabajadores.routes.js";
import actividadRutas from "./actividad.routes.js";
import incidentesRutas from "./incidentes.routes.js";

const router = Router();

router.get("/", verificarRol(["admin", "supervisor"]), obtenerProyectosControlador);
router.post("/", verificarRol(["admin"]), crearProyectoControlador);
router.get("/:id_proyecto", verificarRol(["admin", "supervisor"]), obtenerProyectoPorIdControlador);
router.put("/:id_proyecto", verificarRol(["admin"]), actualizarProyectoControlador);
router.delete("/:id_proyecto", verificarRol(["admin"]), eliminarProyectoControlador);

router.use("/:id_proyecto/vehiculos", vehiculosRutas);
router.use("/:id_proyecto/eq_personal", eqPersonalRutas);
router.use("/:id_proyecto/eq_vehicular", eqVehicularRutas);
router.use("/:id_proyecto/trabajadores", trabajadoresRutas);
router.use("/:id_proyecto/actividades", actividadRutas);
router.use("/:id_proyecto/incidentes", incidentesRutas);

export default router;
