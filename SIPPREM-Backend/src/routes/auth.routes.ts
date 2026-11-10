import {Router} from "express";
import { login } from "../controllers/auth.controllers.js";
import { cambiarClave } from "../controllers/auth.controllers.js";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import { limitarRequestLogin } from "../middleware/limitadorLogin.js";

const router = Router();

router.post("/", limitarRequestLogin, login);
router.patch("/", verificarTokenJWT, verificarRol(["admin","supervisor","patrullero"]) ,cambiarClave);

export default router;