import { apiClient } from './apiClient';

export interface EquipamientoVehicular {
    id_item: string;
    tipo_eq_vehicular: string,
    id_vehiculo : string;
}

export interface TipoArticuloVehicular {
    id_tipo_eq_vehicular: number;
    tipo_eq_vehicular: string;
}

export const eqVehicularService ={
    obtenerArticulosVehiculares: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/eq_vehicular`);
        return res.data.data;
    },

    obtenerTiposArticulosVehiculares: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/eq_vehicular/tipos`);
        return res.data.data;
    },

    agregarArticuloVehicular: async (id_proyecto: string, nuevoArticulo: { id_item: string, id_tipo: number , id_vehiculo: String | null}) => {
        const res = await apiClient.post(`/proyectos/${id_proyecto}/eq_vehicular`, nuevoArticulo);
        return res.data;
    },

    eliminarArticuloVehicular: async (id_proyecto: string, id_item: string) => {
        const res = await apiClient.delete(`/proyectos/${id_proyecto}/eq_vehicular/${id_item}`);
        return res.data;
    }
};