import { apiClient } from './apiClient';

export interface CategoriaIncidente {
  id_categoria_incidente: number;
  categoria: string;
}

export interface NivelGravedadOpcion {
  valor: number;
  etiqueta: string;
  descripcion: string;
  color: string;
}

export interface CrearIncidentePayload {
  id_patrullaje: number;
  id_categoria_incidente: number;
  nivel_gravedad: number;
  observaciones: string;
  ubicacion: string;
  fotografias?: string[];
}

export interface IncidenteRegistrado {
  id_incidente: number;
  id_proyecto: number;
  id_patrullaje: number;
  id_categoria_incidente: number;
  nivel_gravedad: number;
  observaciones: string;
  ubicacion: string;
  fecha_hora: string;
  revisado: boolean;
}

/**
 * Catálogo oficial de categorías de incidente sincronizado con `categoria_incidente` en PostgreSQL.
 */
export const CATEGORIAS_INCIDENTE: CategoriaIncidente[] = [
  { id_categoria_incidente: 1, categoria: 'Vandalismo y daño a la propiedad pública' },
  { id_categoria_incidente: 2, categoria: 'Vehículo mal estacionado o abandonado' },
  { id_categoria_incidente: 3, categoria: 'Luminaria pública defectuosa o apagada' },
  { id_categoria_incidente: 4, categoria: 'Consumo de alcohol o sustancias ilícitas en la vía pública' },
  { id_categoria_incidente: 5, categoria: 'Comercio ambulante no autorizado' },
  { id_categoria_incidente: 6, categoria: 'Presencia de personas en actitud sospechosa' },
  { id_categoria_incidente: 7, categoria: 'Basural clandestino o acumulación de escombros' },
  { id_categoria_incidente: 8, categoria: 'Animales sueltos o potencialmente peligrosos' },
  { id_categoria_incidente: 9, categoria: 'Altercado, riña o disturbios en la vía pública' },
  { id_categoria_incidente: 10, categoria: 'Daño en infraestructura vial (baches, señalética caída, etc.)' },
  { id_categoria_incidente: 11, categoria: 'Ruidos molestos o alteración del orden' },
  { id_categoria_incidente: 12, categoria: 'Otro' }
];

/**
 * Escala de gravedad del 1 al 5 validada por el backend (`nivel_gravedad`).
 */
export const NIVELES_GRAVEDAD: NivelGravedadOpcion[] = [
  { valor: 1, etiqueta: '1 - Muy baja', descripcion: 'Situación menor o preventiva sin riesgo inmediato', color: '#38bdf8' },
  { valor: 2, etiqueta: '2 - Baja', descripcion: 'Incidencia leve que requiere registro y seguimiento', color: '#4ade80' },
  { valor: 3, etiqueta: '3 - Media', descripcion: 'Situación moderada que afecta la convivencia o el entorno', color: '#facc15' },
  { valor: 4, etiqueta: '4 - Alta', descripcion: 'Incidente relevante que requiere pronta atención municipal', color: '#fb923c' },
  { valor: 5, etiqueta: '5 - Crítica', descripcion: 'Urgencia grave o de alto impacto para la seguridad vecinal', color: '#f87171' }
];

/**
 * Convierte coordenadas geográficas al formato WKT `POINT(longitud latitud)` requerido por PostGIS.
 */
export const formatearPuntoWKT = (latitud: number, longitud: number): string => {
  return `POINT(${longitud} ${latitud})`;
};

export const incidentesService = {
  /**
   * Registra un nuevo incidente dentro de un patrullaje activo (`POST /api/v1/proyectos/:id_proyecto/incidentes`).
   */
  crearIncidente: async (id_proyecto: string | number, payload: CrearIncidentePayload) => {
    const response = await apiClient.post(`/proyectos/${id_proyecto}/incidentes`, payload);
    return response.data;
  },

  /**
   * Obtiene el listado de incidentes asociados a un proyecto (`GET /api/v1/proyectos/:id_proyecto/incidentes`).
   */
  obtenerIncidentesDeProyecto: async (id_proyecto: string | number, filtros?: { id_patrullaje?: number; revisado?: boolean }) => {
    const response = await apiClient.get(`/proyectos/${id_proyecto}/incidentes`, {
      params: filtros
    });
    return response.data;
  },

  /**
   * Obtiene el detalle de un incidente específico (`GET /api/v1/proyectos/:id_proyecto/incidentes/:id_incidente`).
   */
  obtenerIncidentePorId: async (id_proyecto: string | number, id_incidente: string | number) => {
    const response = await apiClient.get(`/proyectos/${id_proyecto}/incidentes/${id_incidente}`);
    return response.data;
  }
};
