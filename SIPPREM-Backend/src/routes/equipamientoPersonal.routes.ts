import { Router } from "express";
import {mostrarEquipamientosPersonalesControlador, agregarEquipamientoPersonalControlador, eliminarEquipamientoPersonalControlador } from "../controllers/equipamientoPersonal.controllers.js"
import {mostrarUNequipamientoPersonalControlador, actualizarEquipamientoPersonalControlador} from "../controllers/equipamientoPersonal.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import tipoEqPersonalRutas from "./tipoEqPersonal.routes.js"

const router = Router({ mergeParams: true });

// Se utiliza el GET (para todos y para uno en especifico), POST, PATCH y DELETE
router.get('/', verificarTokenJWT, verificarRol(["admin","supervisor"]), mostrarEquipamientosPersonalesControlador);
router.get('/:id_eq_personal', verificarTokenJWT, verificarRol(["admin","supervisor"]), mostrarUNequipamientoPersonalControlador);
router.post('/', verificarTokenJWT, verificarRol(["admin","supervisor"]), agregarEquipamientoPersonalControlador);
router.patch('/:id_eq_personal', verificarTokenJWT, verificarRol(["admin","supervisor"]), actualizarEquipamientoPersonalControlador);
router.delete('/:id_eq_personal' , verificarTokenJWT, verificarRol(["admin","supervisor"]), eliminarEquipamientoPersonalControlador);

//redirige a los tipos de equipamientos personales
router.use('/tipos', tipoEqPersonalRutas);

export default router;

