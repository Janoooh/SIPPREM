import { apiClient } from './apiClient';

export interface PatrulleroAsignado {
  rut: string;
  nombre: string;
}

export interface PatrullajeProyecto {
  id_patrullaje: number;
  hora_inicio: string;
  hora_termino: string;
  zona: any;
  estado: 'Planificado' | 'En curso' | 'Finalizado' | string;
  patrulleros: PatrulleroAsignado[];
}

export interface CrearPatrullajePayload {
  hora_inicio: string;
  hora_termino: string;
  zona: string;
  patrulleros: string[];
}

export const patrullajesService = {
  /**
    Obtiene todos los patrullajes planificados/ejecutados de un proyecto.
    Endpoint: GET /api/v1/proyectos/:id_proyecto/patrullajes
  **/
  obtenerPatrullajesProyecto: async (id_proyecto: string | number): Promise<PatrullajeProyecto[]> => {
    const response = await apiClient.get(`/proyectos/${id_proyecto}/patrullajes`);
    return response.data.data || [];
  },

  /**
    Crea una nueva planificación de patrullaje en un proyecto.
    Endpoint: POST /api/v1/proyectos/:id_proyecto/patrullajes
  **/
  crearPatrullaje: async (id_proyecto: string | number, datos: CrearPatrullajePayload) => {
    const response = await apiClient.post(`/proyectos/${id_proyecto}/patrullajes`, datos);
    return response.data.data;
  },

  /**
    Actualiza una planificación de patrullaje existente.
    Endpoint: PUT /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje
  **/
  actualizarPatrullaje: async (
    id_proyecto: string | number,
    id_patrullaje: string | number,
    datos: CrearPatrullajePayload
  ) => {
    const response = await apiClient.put(
      `/proyectos/${id_proyecto}/patrullajes/${id_patrullaje}`,
      datos
    );
    return response.data.data;
  },

  /**
    Elimina una planificación de patrullaje que aún no ha iniciado.
    Endpoint: DELETE /api/v1/proyectos/:id_proyecto/patrullajes/:id_patrullaje
  **/
  eliminarPatrullaje: async (id_proyecto: string | number, id_patrullaje: string | number) => {
    const response = await apiClient.delete(
      `/proyectos/${id_proyecto}/patrullajes/${id_patrullaje}`
    );
    return response.data;
  }
};
