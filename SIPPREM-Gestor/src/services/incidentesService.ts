import { isAxiosError } from 'axios';
import { apiClient } from './apiClient';

export interface GeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitud, latitud]
}

export interface IncidenteProyecto {
  id_incidente: number;
  observaciones: string;
  fecha_hora: string;
  ubicacion: GeoJSONPoint | string | null;
  nivel_gravedad: number;
  id_patrullaje: number;
  categoria: string;
  // Campos opcionales para cuando el backend incluya al patrullero en obtenerIncidentes
  rut?: string;
  rut_patrullero?: string;
  nombre_patrullero?: string;
}

export const incidentesService = {
  /**
   * Obtiene el listado de incidentes registrados en un proyecto.
   * Endpoint: GET /api/v1/proyectos/:id_proyecto/incidentes
   */
  obtenerIncidentesProyecto: async (id_proyecto: string | number): Promise<IncidenteProyecto[]> => {
    try {
      const response = await apiClient.get(`/proyectos/${id_proyecto}/incidentes`);
      return response.data?.data || [];
    } catch (error: unknown) {
      // Si el proyecto aún no tiene incidentes, el backend responde 404
      if (isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }
};
