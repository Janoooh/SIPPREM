import {Router} from "express";
import { login } from "../controllers/auth.controllers.js";
import { cambiarClave } from "../controllers/auth.controllers.js";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";

const router = Router();

router.post("/",login);
router.patch("/", verificarTokenJWT ,cambiarClave);

export default router;