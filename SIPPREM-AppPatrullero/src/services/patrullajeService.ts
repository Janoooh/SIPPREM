import { apiClient } from './apiClient';

export const patrullajeService = {
    // Obtener todos los patrullajes de un proyecto (incluye planificación, estado y patrulleros)
    obtenerPatrullajes: async (id_proyecto: string) => {
        const res = await apiClient.get(`/proyectos/${id_proyecto}/patrullajes`);
        return res.data.data;
    },

    // Iniciar un patrullaje (RF06)
    iniciarPatrullaje: async (id_proyecto: string, id_patrullaje: number, datosInicio: { id_vehiculo: string, eq_personal: string[] }) => {
        const res = await apiClient.post(`/proyectos/${id_proyecto}/patrullajes/${id_patrullaje}/iniciar`, datosInicio);
        return res.data;
    },

    // Finalizar un patrullaje (RF06)
    finalizarPatrullaje: async (id_proyecto: string, id_patrullaje: number) => {
        const res = await apiClient.patch(`/proyectos/${id_proyecto}/patrullajes/${id_patrullaje}/finalizar`);
        return res.data;
    }
};