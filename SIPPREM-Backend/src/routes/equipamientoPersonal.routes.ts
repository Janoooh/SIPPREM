import { Router } from "express";
import {mostrarEquipamientosPersonalesControlador, agregarEquipamientoPersonalControlador, eliminarEquipamientoPersonalControlador } from "../controllers/equipamientoPersonal.controllers.js"
import {mostrarUNequipamientoPersonalControlador, actualizarEquipamientoPersonalControlador} from "../controllers/equipamientoPersonal.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import tipoEqPersonalRutas from "./tipoEqPersonal.routes.js"

const router = Router({ mergeParams: true });

// Se utiliza el GET, POST y DELETE
router.get('/' , mostrarEquipamientosPersonalesControlador);
router.get('/:id_eq_personal', mostrarUNequipamientoPersonalControlador);
router.post('/', agregarEquipamientoPersonalControlador);
router.patch('/:id_eq_personal', actualizarEquipamientoPersonalControlador);
router.delete('/:id_eq_personal' , eliminarEquipamientoPersonalControlador);


//redirige a los tipos de equipamientos personales
router.use('/tipos', tipoEqPersonalRutas);

export default router;

