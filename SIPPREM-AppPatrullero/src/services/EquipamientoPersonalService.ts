import { apiClient } from './apiClient';

export interface dataEqPersonal {
    id_item: string;
    talla: string;
    tipo_eq_personal: string; 
}

export interface TipoArticuloPersonal {
    id_tipo_eq_personal: number;
    tipo_eq_personal: string;
}

export const eqPersonalService = {
    obtenerArticulosPersonales: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/eq_personal`);
        return res.data.data;
    },

    obtenerTiposArticulosPersonales: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/eq_personal/tipos`);
        return res.data.data;
    },

    agregarArticuloPersonal: async (id_proyecto: string, nuevoArticulo: { id_item: string, id_tipo: number, talla : string }) => {
        const res = await apiClient.post(`/proyectos/${id_proyecto}/eq_personal`, nuevoArticulo);
        return res.data;
    },

    eliminarArticuloPersonal: async (id_proyecto: string, id_item: string) => {
        const res = await apiClient.delete(`/proyectos/${id_proyecto}/eq_personal/${id_item}`);
        return res.data;
    }
};