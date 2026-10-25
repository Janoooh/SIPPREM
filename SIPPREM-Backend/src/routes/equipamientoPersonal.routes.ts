import { Router } from "express";
import {mostrarEquipamientosPersonalesControlador, agregarEquipamientoPersonalControlador, eliminarEquipamientoPersonalControlador } from "../controllers/equipamientoPersonal.controllers.js"
import {mostrarUNequipamientoPersonalControlador, actualizarEquipamientoPersonalControlador} from "../controllers/equipamientoPersonal.controllers.js"
import { verificarRol } from "../middleware/verificarRol.js";
import tipoEqPersonalRutas from "./tipoEqPersonal.routes.js"

const router = Router({ mergeParams: true });

//redirige a los tipos de equipamientos personales
router.use('/tipos', tipoEqPersonalRutas);

// Se utiliza el GET (para todos y para uno en especifico), POST, PATCH y DELETE
router.get('/', verificarRol(["admin","supervisor"]), mostrarEquipamientosPersonalesControlador);
router.get('/:id_eq_personal', verificarRol(["admin","supervisor"]), mostrarUNequipamientoPersonalControlador);
router.post('/', verificarRol(["admin","supervisor"]), agregarEquipamientoPersonalControlador);
router.patch('/:id_eq_personal', verificarRol(["admin","supervisor"]), actualizarEquipamientoPersonalControlador);
router.delete('/:id_eq_personal' , verificarRol(["admin","supervisor"]), eliminarEquipamientoPersonalControlador);


export default router;

