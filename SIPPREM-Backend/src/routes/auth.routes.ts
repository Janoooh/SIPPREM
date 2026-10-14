import {Router} from "express";
import {testeo} from "../controllers/auth.controllers.js"

const router = Router();

router.post("/", testeo);


export default router;