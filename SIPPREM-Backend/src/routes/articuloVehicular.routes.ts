import { Router } from "express";
import {mostrarArticulosVehiculares, mostrarArticuloVehicular, addArticuloVehicular,actualizarArticuloVehicular, eliminarArticuloVehicular} from "../controllers/articuloVehicular.controllers.js"

const router = Router();

router.get('/', mostrarArticulosVehiculares);
router.get('/:id', mostrarArticuloVehicular);
router.post('/', addArticuloVehicular);
router.put('/:id', actualizarArticuloVehicular)
router.delete('/:id', eliminarArticuloVehicular);

export default router;