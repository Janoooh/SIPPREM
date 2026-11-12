import { Router } from "express";
import { verificarRol } from "../middleware/verificarRol.js";
import { actualizarUsuario, obtenerPatrullajesDeUsuario, obtenerUsuarios, reestablecerClave, restaurarUsuario } from "../controllers/usuario.controllers.js";
import { obtenerUsuario } from "../controllers/usuario.controllers.js";
import { crearUsuario } from "../controllers/usuario.controllers.js";
import { eliminarUsuario } from "../controllers/usuario.controllers.js";
import { obtenerMiPerfil } from "../controllers/usuario.controllers.js";
import { obtenerProyectosDeUsuario } from "../controllers/usuario.controllers.js";

const router = Router();

router.get("/", verificarRol(["admin"]),obtenerUsuarios);
router.get("/me",verificarRol(["admin","supervisor","patrullero"]),obtenerMiPerfil);
router.get("/me/patrullajes",verificarRol(["patrullero"]),obtenerPatrullajesDeUsuario);
router.get("/:id_user", verificarRol(["admin"]), obtenerUsuario);
router.get("/:id_user/proyectos",verificarRol(["admin"]),obtenerProyectosDeUsuario);
router.post("/",verificarRol(["admin"]),crearUsuario);
router.put("/:id_user",verificarRol(["admin"]),actualizarUsuario);
router.delete("/:id_user",verificarRol(["admin"]),eliminarUsuario);
router.patch("/:id_user/reestablecer-clave",verificarRol(["admin"]),reestablecerClave);
router.patch("/:id_user/restaurar",verificarRol(["admin"]),restaurarUsuario);

export default router;