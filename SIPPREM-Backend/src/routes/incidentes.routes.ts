import { Router } from "express";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import {
  obtenerIncidentesControlador,
  crearIncidenteControlador,
  obtenerIncidentePorIdControlador
} from "../controllers/incidentes.controllers.js";

const router = Router({ mergeParams: true });

router.get("/", verificarTokenJWT, verificarRol(["admin", "supervisor"]), obtenerIncidentesControlador);
router.post("/", verificarTokenJWT, verificarRol(["admin", "supervisor", "patrullero"]), crearIncidenteControlador);
router.get("/:id_incidente", verificarTokenJWT, verificarRol(["admin", "supervisor", "patrullero"]), obtenerIncidentePorIdControlador);

export default router;