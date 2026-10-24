import { Router } from "express";
import { verificarRol } from "../middleware/verificarRol.js";
import { obtenerPatrullajes } from "../controllers/patrullaje.controllers.js";


const router = Router({mergeParams: true});

router.get("/",verificarRol(["admin","supervisor"]), obtenerPatrullajes);

export default router;