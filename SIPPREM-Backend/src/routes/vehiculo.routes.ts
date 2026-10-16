import {Router} from "express";
import {mostrarVehiculos, buscarVehiculo, addVehiculo, eliminarVehiculo} from "../controllers/vehiculo.controllers.js"

const router = Router();

router.get('/', mostrarVehiculos);
router.get('/:id', buscarVehiculo);
router.post('/', addVehiculo);
router.delete('/:id', eliminarVehiculo);

export default router;