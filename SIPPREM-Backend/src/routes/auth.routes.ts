import {Router} from "express";
import { login } from "../controllers/auth.controllers.js";
import { cambiarClave } from "../controllers/auth.controllers.js";

const router = Router();

router.post("/",login);
router.patch("/",cambiarClave);

export default router;