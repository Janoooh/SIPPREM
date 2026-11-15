import { apiClient } from './apiClient';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';

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

export const usuarioService = {
    obtenerPatrullajesUsuario: async (): Promise<PatrullajeUsuario[]> => {
        const res = await apiClient.get('/usuarios/me/patrullajes');
        return res.data.data || []; // Retorna la lista de patrullajes ordenada por fecha desde el backend
    },

    obtenerMiPerfil: async (): Promise<UsuarioPerfil> => {
        const res = await apiClient.get('/usuarios/me');
        return res.data.data;
    }
};
