import { Router } from "express";
import { verificarRol } from "../middleware/verificarRol.js";
import {
  obtenerIncidentesControlador,
  crearIncidenteControlador,
  obtenerIncidentePorIdControlador
} from "../controllers/incidentes.controllers.js";

const router = Router({ mergeParams: true });

router.get("/", verificarRol(["admin", "supervisor"]), obtenerIncidentesControlador);
router.post("/", verificarRol(["admin", "supervisor", "patrullero"]), crearIncidenteControlador);
router.get("/:id_incidente", verificarRol(["admin", "supervisor", "patrullero"]), obtenerIncidentePorIdControlador);

export default router;