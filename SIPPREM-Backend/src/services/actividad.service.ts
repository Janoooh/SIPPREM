import { poolDb } from "../config/db.js";

// Obtener todas las actividades de un proyecto específico
export const obtenerActividadesPorProyecto = async (id_proyecto: number )=> {
    const query = `SELECT id_actividad, titulo, fecha, descripcion, id_proyecto 
    FROM actividad
    WHERE id_proyecto = $1
    ORDER BY fecha ASC;
    `;
    const resultado = await poolDb.query(query,[id_proyecto])
    return resultado.rows;
}