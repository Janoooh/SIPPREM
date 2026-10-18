import { Router } from "express";
import {mostrarEquipamientosPersonalesControlador, agregarEquipamientoPersonalControlador, eliminarEquipamientoPersonalControlador } from "../controllers/equipamientoPersonal.controllers.js"

const router = Router();

router.get('/proyectos/:id_proyecto', mostrarEquipamientosPersonalesControlador);
router.post('/', agregarEquipamientoPersonalControlador);
router.delete('/:id_eq_personal', eliminarEquipamientoPersonalControlador);

//router.get('/:id', mostrarEquipamientoPersonalControlador);
//router.put('/:id', actualizarEquipamientoPersonalControlador);

export default router;

