/* ==========================================================================
   INICIO SECCIÓN MODIFICADA: Interfaz adaptada a los campos de la BD/Backend
   ========================================================================== */
export interface proyectoPatrullaje {
    id_proyecto: number;
    nombre_proyecto: string;
    nombre_sector?: string;
    fecha_inicio?: string | Date;
    fecha_termino?: string | Date;
    presupuesto?: number;
    zona_seleccionada?: any;
    activo?: boolean;
}

/* Interfaz para el payload enviado al crear un nuevo proyecto en POST /proyectos */
export interface nuevoProyectoData {
    nombre_proyecto: string;
    nombre_sector?: string;
    presupuesto: number;
    fecha_inicio: string;
    fecha_termino: string;
    zona_seleccionada: string;
}
/* ==========================================================================
   FIN SECCIÓN MODIFICADA
   ========================================================================== */
