import {Router} from "express";
import {verVehiculos, verVehiculoID, agregarVehiculo, borrarVehiculo} from "../controllers/vehiculo.controllers.js"

const router = Router();

//aun no se como funcionan estas rutas asi que lol
//en ninguna parte sale para modificar un vehiculo
router.get('/', verVehiculos);
router.get('/:id', verVehiculoID);
router.post('/', agregarVehiculo);
router.delete('/:id', borrarVehiculo);

export default router;