import {Router} from "express";
import {mostrarVehiculosControlador, agregarVehiculoControlador, eliminarVehiculoControlador, actualizarVehiculoControlador, mostrarUNvehiculoControlador} from "../controllers/vehiculo.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import rutasTipoVehiculo from "./tipoVehiculo.routes.js"

const router = Router({ mergeParams: true });

// Aqui se manejan las rutas. Para los vehiculos los métodos utilizados son GET, POST, PATCH y DELETE.
router.get('/', verificarTokenJWT, verificarRol(["admin","supervisor"]), mostrarVehiculosControlador);
router.get('/:id_vehiculo', verificarTokenJWT, verificarRol(["admin","supervisor"]) , mostrarUNvehiculoControlador);
router.post('/', verificarTokenJWT, verificarRol(["admin","supervisor"]), agregarVehiculoControlador);
router.patch('/:id_vehiculo', verificarTokenJWT, verificarRol(["admin","supervisor"]), actualizarVehiculoControlador);
router.delete('/:id_vehiculo', verificarTokenJWT, verificarRol(["admin","supervisor"]), eliminarVehiculoControlador);

// Esto redirige a la ruta que muestra los tipo de vehiculo
router.use('/tipos', rutasTipoVehiculo);

export default router;