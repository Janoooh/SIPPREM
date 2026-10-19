import {Router} from "express";
import {mostrarVehiculosControlador, agregarVehiculoControlador, eliminarVehiculoControlador} from "../controllers/vehiculo.controllers.js"

const router = Router();

router.get('/proyectos/:id_proyecto', mostrarVehiculosControlador);
router.post('/', agregarVehiculoControlador);
router.delete('/:id_vehiculo', eliminarVehiculoControlador);

export default router;