import { apiClient } from './apiClient';

export interface dataVehiculo {
    id_item: string;
    nombre_vehiculo: string;
    tipo_vehiculo: string; 
}

export interface TipoVehiculo {
    id_tipo_vehiculo: number;
    tipo_vehiculo: string;
}

export const vehiculosService = {
    obtenerVehiculos: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/vehiculos`);
        return res.data.data; 
    },

    obtenerTiposVehiculo: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/vehiculos/tipos`);
        return res.data.data;
    },

    agregarVehiculo: async (id_proyecto: string, nuevoVehiculo: { id_item: string, nombre_vehiculo: string, id_tipo_vehiculo: number }) => {
        const res = await apiClient.post(`/proyectos/${id_proyecto}/vehiculos`, nuevoVehiculo);
        return res.data;
    },

    eliminarVehiculo: async (id_proyecto: string, id_item: string) => {
        const res = await apiClient.delete(`/proyectos/${id_proyecto}/vehiculos/${id_item}`);
        return res.data;
    }
};