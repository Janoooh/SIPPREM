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

// Crear una nueva activadad 
export const crearActividad = async(titulo: string, fecha: string, descripcion: string, id_proyecto : number)=> {
    const query = `
    INSERT INTO actividad(titulo, fecha, descripcion, id_proyecto)
    VALUES($1, $2,$3 , $4 )
    RETURNING *; 
    `;
    const resultado = await poolDb.query(query,[titulo, fecha, descripcion, id_proyecto]);
    return resultado.rows[0];

}