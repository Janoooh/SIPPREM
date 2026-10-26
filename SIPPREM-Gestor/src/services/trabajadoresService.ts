import { apiClient } from './apiClient';

export interface TrabajadorProyecto {
  rut: string;
  nombre: string;
  correo: string;
  telefono: string;
  tipo_rol: string;
}

export const trabajadoresService = {
  /**
    Obtiene todos los trabajadores asignados a un proyecto específico.
    Endpoint: GET /api/v1/proyectos/:id_proyecto/trabajadores
  **/
  obtenerTrabajadoresProyecto: async (id_proyecto: string | number): Promise<TrabajadorProyecto[]> => {
    const response = await apiClient.get(`/proyectos/${id_proyecto}/trabajadores`);
    return response.data.data || [];
  },

  /**
    Asigna un trabajador existente a un proyecto.
    Endpoint: POST /api/v1/proyectos/:id_proyecto/trabajadores
  **/
  asignarTrabajadorProyecto: async (id_proyecto: string | number, rut: string) => {
    const response = await apiClient.post(`/proyectos/${id_proyecto}/trabajadores`, { rut });
    return response.data;
  },

  /**
    Retira un trabajador de un proyecto.
    Endpoint: DELETE /api/v1/proyectos/:id_proyecto/trabajadores/:rut
  **/
  sacarTrabajadorProyecto: async (id_proyecto: string | number, rut: string) => {
    const response = await apiClient.delete(`/proyectos/${id_proyecto}/trabajadores/${rut}`);
    return response.data;
  }
};
