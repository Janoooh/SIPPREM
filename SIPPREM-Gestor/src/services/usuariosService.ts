import { dataUsuario } from '../interfaces/dataUsuario';
import { apiClient } from './apiClient';

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
        
        const resCrearUsuario = await apiClient.post("/usuarios",nuevoUsuario);
        return resCrearUsuario;
    },

    /*Funcion eliminarUsuario: Encargada de eliminar un usuario de la base de datos,
    usando la API del backend con el apiClient. Recibe el identificador del usuario a eliminar. */
    eliminarUsuario: async (id_user: string) => {

        const resEliminarUsuario = await apiClient.delete(`/usuarios/${id_user}`);
        return;
    },

    /*Funcion restaurarUsuario: Encargada de restaurar un usuario que fue eliminado de 
    la base de datos. Usa el apiClient para mandar la peticion patch encargada de 
    restaurar el usuario con id entregada.*/
    restaurarUsuario: async (id_user: string) => {

        const resRestaurarUsuario = await apiClient.patch(`/usuarios/${id_user}/restaurar`);
        return;
    }

};