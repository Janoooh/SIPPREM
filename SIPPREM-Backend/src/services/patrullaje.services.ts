import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

interface tipoPatrullaje{
    hora_inicio: string,
    hora_termino: string,
    zona: string,
    id_proyecto: number,
    patrulleros: string[]
};

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

export const crearPlanificacionPatrullaje = async (patrullajeNuevo: tipoPatrullaje): Promise<respuestaServices> => {
    const { hora_inicio, hora_termino, zona, id_proyecto, patrulleros } = patrullajeNuevo;

    const cliente = await poolDb.connect();

    try {
        await cliente.query("BEGIN");

        const queryCrearPlanificacionPatrullaje = `
            INSERT INTO planificacion_patrullaje (hora_inicio, hora_termino, zona, id_proyecto)
            VALUES ($1, $2, ST_GeomFromText($3, 4326), $4)
            RETURNING id_patrullaje, hora_inicio, hora_termino, ST_AsGeoJSON(zona)::json AS zona, id_proyecto;
        `;

        const resPlanificacion = await cliente.query(queryCrearPlanificacionPatrullaje, [hora_inicio, hora_termino, zona, id_proyecto]);

        const planificacionCreada = resPlanificacion.rows[0];

        const queryAsignarPatrulleros = `
            INSERT INTO realizacion_patrullaje (rut, id_patrullaje)
            SELECT unnest($1::varchar[]), $2;
        `;

        await cliente.query(queryAsignarPatrulleros, [patrulleros, planificacionCreada.id_patrullaje]);

        await cliente.query("COMMIT");

        return {
            exito: true,
            codHTTP: 201,
            explicacion: "Planificacion de patrullaje creada correctamente.",
            datos: {
                ...planificacionCreada,
                patrulleros
            }
        };
    } catch (error) {
        await cliente.query("ROLLBACK");
        throw error;
    } finally {
        cliente.release();
    }
};