import { apiClient } from './apiClient';
import { ActividadFutura } from '../interfaces/actividadFutura';
import { ActividadPayload } from '../interfaces/actividadPayload';

export const actividadesService = {
  /**
    Obtiene todas las actividades asociadas a un proyecto específico.
    Endpoint: GET /api/v1/proyectos/:id_proyecto/actividades
  **/
  obtenerActividadesProyecto: async (id_proyecto: string | number): Promise<ActividadFutura[]> => {
    const response = await apiClient.get(`/proyectos/${id_proyecto}/actividades`);
    return response.data.data || [];
  },

  /**
    Crea una nueva actividad para un proyecto específico.
    Endpoint: POST /api/v1/proyectos/:id_proyecto/actividades
  **/
  crearActividad: async (id_proyecto: string | number, datos: ActividadPayload): Promise<ActividadFutura> => {
    const response = await apiClient.post(`/proyectos/${id_proyecto}/actividades`, datos);
    return response.data.data;
  },

  /**
    Actualiza los datos de una actividad existente.
    Endpoint: PUT /api/v1/proyectos/:id_proyecto/actividades/:id_actividad
  **/
  actualizarActividad: async (id_proyecto: string | number, id_actividad: string | number, datos: ActividadPayload): Promise<ActividadFutura> => {
    const response = await apiClient.put(`/proyectos/${id_proyecto}/actividades/${id_actividad}`, datos);
    return response.data.data;
  },

  /**
    Elimina (borrado lógico) una actividad existente.
    Endpoint: DELETE /api/v1/proyectos/:id_proyecto/actividades/:id_actividad
  **/
  eliminarActividad: async (id_proyecto: string | number, id_actividad: string | number) => {
    const response = await apiClient.delete(`/proyectos/${id_proyecto}/actividades/${id_actividad}`);
    return response.data;
  }
};
