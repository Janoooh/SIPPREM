export interface ActividadFutura {
  // Campos provenientes del backend (tabla actividad)
  id_actividad?: number;
  titulo?: string;
  fecha?: string | Date;
  descripcion?: string;
  id_proyecto?: number;
  eliminado?: boolean;

  // Campos de compatibilidad con la versión estática previa
  id?: number;
  tipoActividad?: string;
  fechaHoraInicio?: Date | string;
}
