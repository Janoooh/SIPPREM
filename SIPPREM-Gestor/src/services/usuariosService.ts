import { dataUsuario } from '../interfaces/dataUsuario';
import { apiClient } from './apiClient';

export interface UsuarioPerfil {
    rut: string;
    nombre: string;
    correo: string;
    telefono: string | null;
    foto: string | null;
    id_rol: number;
    tipo_rol: string;
    fecha_registro: string;
}

export interface ProyectoUsuario {
    id_proyecto: number;
    nombre_proyecto: string;
}

export const usuariosService = {
    /* Funcion obtenerUsuarios: Encargada de traer los usuarios del backend con
    el uso del apiClient. Recibe un estado, el cual indica si traemos los activos,
    o los eliminados. */
    obtenerUsuarios: async (estado: string) => {
        
        const params = estado ? { estado } : {};
        const resObtenerUsuarios = await apiClient.get("/usuarios", { params });
        
        return resObtenerUsuarios.data.data;
    },

    /*Funcion crearUsuario: Encargada de crear un usuario nuevo en el sistema, enviando
    la informacion al backend para hacer el almacenamiento de dichos datos. */
    crearUsuario: async (nuevoUsuario: dataUsuario) => {
        
        const resCrearUsuario = await apiClient.post("/usuarios", nuevoUsuario);
        return resCrearUsuario;
    },

    obtenerUsuario: async (id_user: string) => {
        
        const resObtenerUsuario = await apiClient.get(`/usuarios/${id_user}`);
        return resObtenerUsuario;
    },

    /*Funcion obtenerMiPerfil: Obtiene los datos del perfil del usuario autenticado actual.
    Endpoint: GET /api/v1/usuarios/me */
    obtenerMiPerfil: async (): Promise<UsuarioPerfil> => {

        const resMiPerfil = await apiClient.get("/usuarios/me");
        return resMiPerfil.data.data;
    },

    /*Funcion obtenerProyectosDeUsuario: Obtiene los proyectos asignados a un usuario por su RUT.
    Endpoint: GET /api/v1/usuarios/:id_user/proyectos */
    obtenerProyectosDeUsuario: async (id_user: string): Promise<ProyectoUsuario[]> => {

        const resProyectos = await apiClient.get(`/usuarios/${id_user}/proyectos`);
        return resProyectos.data.data || [];
    },

    modificarUsuario: async (usuarioModificado: dataUsuario) => {

        const resModificarUsuario = await apiClient.put(`/usuarios/${usuarioModificado.rut}`,usuarioModificado);
        return resModificarUsuario;
    },

    /*Funcion eliminarUsuario: Encargada de eliminar un usuario de la base de datos,
    usando la API del backend con el apiClient. Recibe el identificador del usuario a eliminar. */
    eliminarUsuario: async (id_user: string) => {

        const resEliminarUsuario = await apiClient.delete(`/usuarios/${id_user}`);
        return resEliminarUsuario;
    },

    /*Funcion restaurarUsuario: Encargada de restaurar un usuario que fue eliminado de 
    la base de datos. Usa el apiClient para mandar la peticion patch encargada de 
    restaurar el usuario con id entregada.*/
    restaurarUsuario: async (id_user: string) => {

        const resRestaurarUsuario = await apiClient.patch(`/usuarios/${id_user}/restaurar`);
        return resRestaurarUsuario;
    },

    /*Funcion reestablecerClave: Encargada de solicitar al backend el restablecimiento
    de la contrasenia de un usuario a una aleatoria, con tal de poder cambiar su contrasenia
    cuando vuelva a entrar al sistema.*/
    reestablecerClave: async (id_user: string) => {

        const resReestablecer = await apiClient.patch(`/usuarios/${id_user}/reestablecer-clave`);
        return resReestablecer;
    }

};
