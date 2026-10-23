import { Router } from "express";
import {mostrarEquipamientosVehicularesControlador, agregarEquipamientoVehicularControlador,eliminarEquipamientoVehicularControlador} from "../controllers/equipamientoVehicular.controllers.js"
import {mostrarUNequipamientoVehicularControlador, actualizarEquipamientoVehicularControlador } from "../controllers/equipamientoVehicular.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import tipoEqVehicularRutas from "./tipoEqVehicular.routes.js"

const router = Router({ mergeParams: true });

// get para toda la coleccion, para un recurso en especifico, post, patch y delete.
router.get('/' , verificarRol(["admin","supervisor"]), mostrarEquipamientosVehicularesControlador);
router.get('/:id_eq_vehicular', verificarRol(["admin","supervisor"]), mostrarUNequipamientoVehicularControlador);
router.post('/' , verificarRol(["admin","supervisor"]), agregarEquipamientoVehicularControlador);
router.patch('/:id_eq_vehicular', verificarRol(["admin","supervisor"]), actualizarEquipamientoVehicularControlador);
router.delete('/:id_eq_vehicular', verificarRol(["admin","supervisor"]), eliminarEquipamientoVehicularControlador);

//redirige a los tipos de equipamientos vehiculares
router.use('/tipos', tipoEqVehicularRutas);

export default router;