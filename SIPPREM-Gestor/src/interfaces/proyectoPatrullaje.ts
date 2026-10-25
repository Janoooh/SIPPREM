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
    activo?: boolean;
};
/* ==========================================================================
   FIN SECCIÓN MODIFICADA
   ========================================================================== */
