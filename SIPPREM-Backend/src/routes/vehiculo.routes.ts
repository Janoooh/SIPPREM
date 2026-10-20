import {Router} from "express";
import {mostrarVehiculosControlador, agregarVehiculoControlador, eliminarVehiculoControlador, actualizarVehiculoControlador, mostrarUNvehiculoControlador} from "../controllers/vehiculo.controllers.js"
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import rutasTipoVehiculo from "./tipoVehiculo.routes.js"

const router = Router({ mergeParams: true });

// Aqui se manejan las rutas. Para los vehiculos los métodos utilizados son GET, POST, PATCH y DELETE. , verificarTokenJWT, verificarRol(["admin", "supervisor"])
router.get('/', mostrarVehiculosControlador);
router.get('/:id_vehiculo', mostrarUNvehiculoControlador);
router.post('/', agregarVehiculoControlador);
router.patch('/:id_vehiculo', actualizarVehiculoControlador);
router.delete('/:id_vehiculo', eliminarVehiculoControlador);

// Esto redirige a la ruta que muestra los tipo de vehiculo
router.use('/tipos', rutasTipoVehiculo);
export default router;