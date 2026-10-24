import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

export const obtenerPatrullajes = async (id_proyecto: string): Promise<respuestaServices> => {

    const queryObtenerPatrullajes = `
        SELECT 
            p.id_patrullaje,
            p.hora_inicio,
            p.hora_termino,
            
            CASE 
                WHEN e.hora_real_termino IS NOT NULL THEN 'Finalizado'
                WHEN e.hora_real_inicio IS NOT NULL THEN 'En curso'
                ELSE 'Planificado'
            END AS estado,
            COALESCE(
                json_agg(
                    json_build_object('rut', u.rut, 'nombre', u.nombre)
                ) FILTER (WHERE u.rut IS NOT NULL), 
                '[]'
            ) AS patrulleros
        FROM planificacion_patrullaje p
        LEFT JOIN ejecucion_patrullaje e ON p.id_patrullaje = e.id_patrullaje
        LEFT JOIN realizacion_patrullaje rp ON p.id_patrullaje = rp.id_patrullaje
        LEFT JOIN usuario u ON rp.rut = u.rut
        WHERE p.id_proyecto = $1
        GROUP BY p.id_patrullaje, e.hora_real_inicio, e.hora_real_termino
        ORDER BY p.hora_inicio ASC;
    `;

    const resQueryObtenerPatrullajes = await poolDb.query(queryObtenerPatrullajes,[id_proyecto]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Patrullajes obtenidos correctamente.",
        datos: resQueryObtenerPatrullajes.rows
    };
};