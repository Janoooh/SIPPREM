import { Router } from "express";
import {mostrarEquipamientosVehicularesControlador, agregarEquipamientoVehicularControlador,eliminarEquipamientoVehicularControlador} from "../controllers/equipamientoVehicular.controllers.js"

const router = Router();

router.get('/proyectos/:id_proyecto', mostrarEquipamientosVehicularesControlador);
router.post('/', agregarEquipamientoVehicularControlador);
router.delete('/:id_eq_vehicular', eliminarEquipamientoVehicularControlador);

//router.put('/:id, mostrarEquipamientoVehicular);
//router.put('/:id_eq_vehicular', actualizarEquipamientoVehicularControlador);

export default router;