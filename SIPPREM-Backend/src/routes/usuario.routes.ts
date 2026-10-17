import { Router } from "express";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import { obtenerUsuarios } from "../controllers/usuario.controllers.js";
import { obtenerUsuario } from "../controllers/usuario.controllers.js";

const router = Router();

router.get("/",verificarTokenJWT, verificarRol(["admin"]),obtenerUsuarios);
router.get("/:id_user",verificarTokenJWT, verificarRol(["admin"]), obtenerUsuario);

export default router;