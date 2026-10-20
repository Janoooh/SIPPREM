import { Router } from "express";
import {mostrarEquipamientosVehicularesControlador, agregarEquipamientoVehicularControlador,eliminarEquipamientoVehicularControlador} from "../controllers/equipamientoVehicular.controllers.js"
import {mostrarUNequipamientoVehicularControlador, actualizarEquipamientoVehicularControlador } from "../controllers/equipamientoVehicular.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import tipoEqVehicularRutas from "./tipoEqVehicular.routes.js"

const router = Router({ mergeParams: true });

// get para toda la coleccion, post y delete 
router.get('/' , mostrarEquipamientosVehicularesControlador);
router.get('/:id_eq_vehicular', mostrarUNequipamientoVehicularControlador);
router.post('/' , agregarEquipamientoVehicularControlador);
router.patch('/:id_eq_vehicular', actualizarEquipamientoVehicularControlador);
router.delete('/:id_eq_vehicular', eliminarEquipamientoVehicularControlador);

//redirige a los tipos de equipamientos vehiculares
router.use('/tipos', tipoEqVehicularRutas);

export default router;