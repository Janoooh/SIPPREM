import { Router } from "express";
import { verificarTokenJWT } from "../middleware/verificarTokenJWT.js";
import { verificarRol } from "../middleware/verificarRol.js";
import { actualizarUsuario, obtenerUsuarios, reestablecerClave, restaurarUsuario } from "../controllers/usuario.controllers.js";
import { obtenerUsuario } from "../controllers/usuario.controllers.js";
import { crearUsuario } from "../controllers/usuario.controllers.js";
import { eliminarUsuario } from "../controllers/usuario.controllers.js";
import { obtenerMiPerfil } from "../controllers/usuario.controllers.js";
import { obtenerProyectosDeUsuario } from "../controllers/usuario.controllers.js";

const router = Router();

router.get("/",verificarTokenJWT, verificarRol(["admin"]),obtenerUsuarios);
router.get("/me",verificarTokenJWT,verificarRol(["admin","supervisor","patrullero"]),obtenerMiPerfil);
router.get("/:id_user",verificarTokenJWT, verificarRol(["admin"]), obtenerUsuario);
router.get("/:id_user/proyectos",verificarTokenJWT,verificarRol(["admin"]),obtenerProyectosDeUsuario);
router.post("/",verificarTokenJWT,verificarRol(["admin"]),crearUsuario);
router.put("/:id_user",verificarTokenJWT,verificarRol(["admin"]),actualizarUsuario);
router.delete("/:id_user",verificarTokenJWT,verificarRol(["admin"]),eliminarUsuario);
router.patch("/:id_user/reestablecer-clave",verificarTokenJWT,verificarRol(["admin"]),reestablecerClave);
router.patch("/:id_user/restaurar",verificarTokenJWT,verificarRol(["admin"]),restaurarUsuario);

export default router;