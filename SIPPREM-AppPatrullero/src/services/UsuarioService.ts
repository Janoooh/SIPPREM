import { apiClient } from './apiClient';

export const usuarioService = {
    obtenerPatrullajesUsuario: async () => {
        const res = await apiClient.get('/usuarios/me/patrullajes');
        return res.data.data; // Retorna la lista de patrullajes de la base de datos
    }
};