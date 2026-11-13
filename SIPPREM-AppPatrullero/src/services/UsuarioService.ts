import { apiClient } from './apiClient';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';

export const usuarioService = {
    obtenerPatrullajesUsuario: async (): Promise<PatrullajeUsuario[]> => {
        const res = await apiClient.get('/usuarios/me/patrullajes');
        return res.data.data || []; // Retorna la lista de patrullajes ordenada por fecha desde el backend
    }
};
