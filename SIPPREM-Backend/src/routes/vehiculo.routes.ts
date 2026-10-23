import {Router} from "express";
import {mostrarVehiculosControlador, agregarVehiculoControlador, eliminarVehiculoControlador, actualizarVehiculoControlador, mostrarUNvehiculoControlador} from "../controllers/vehiculo.controllers.js"
import { verificarRol } from "../middleware/verificarRol.js";
import rutasTipoVehiculo from "./tipoVehiculo.routes.js"

const router = Router({ mergeParams: true });

// Aqui se manejan las rutas. Para los vehiculos los métodos utilizados son GET, POST, PATCH y DELETE.
router.get('/', verificarRol(["admin","supervisor"]), mostrarVehiculosControlador);
router.get('/:id_vehiculo', verificarRol(["admin","supervisor"]) , mostrarUNvehiculoControlador);
router.post('/', verificarRol(["admin","supervisor"]), agregarVehiculoControlador);
router.patch('/:id_vehiculo', verificarRol(["admin","supervisor"]), actualizarVehiculoControlador);
router.delete('/:id_vehiculo', verificarRol(["admin","supervisor"]), eliminarVehiculoControlador);

// Esto redirige a la ruta que muestra los tipo de vehiculo
router.use('/tipos', rutasTipoVehiculo);

export default router;