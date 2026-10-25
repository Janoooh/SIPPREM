import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

interface tipoPatrullaje{
    hora_inicio: string,
    hora_termino: string,
    zona: string,
    id_proyecto: number,
    patrulleros: string[]
};

/* ==========================================================================
   INICIO SECCIÓN AGREGADA: Interfaz de datos para iniciar patrullaje (RF06)
   ========================================================================== */
interface tipoIniciarPatrullaje {
    id_proyecto: number;     // ID del proyecto al que pertenece el patrullaje
    id_patrullaje: number;   // ID del patrullaje planificado que se va a iniciar
    rut_usuario: string;     // RUT extraído del token JWT de quien inicia el patrullaje
    id_vehiculo: string;     // Identificador/patente del vehículo a utilizar (ej: 'VEH-001')
    eq_personal: string[];   // Lista de IDs de equipamiento personal a llevar (ej: ['EQP-001'])
}
/* ==========================================================================
   FIN SECCIÓN AGREGADA: Interfaz de datos para iniciar patrullaje (RF06)
   ========================================================================== */

export const obtenerPatrullajes = async (id_proyecto: string): Promise<respuestaServices> => {

    const queryObtenerPatrullajes = `
        SELECT 
            p.id_patrullaje,
            p.hora_inicio,
            p.hora_termino,
            ST_AsGeoJSON(p.zona)::json AS zona,
            
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

export const actualizarPlanificacionPatrullaje = async (id_patrullaje: number, patrullajeModificado: tipoPatrullaje ): Promise<respuestaServices> => {
    const { hora_inicio, hora_termino, zona, id_proyecto, patrulleros } = patrullajeModificado;

    const queryVerificarEstado = `
        SELECT 
            p.id_patrullaje,
            e.id_patrullaje AS id_ejecucion
        FROM planificacion_patrullaje p
        LEFT JOIN ejecucion_patrullaje e ON p.id_patrullaje = e.id_patrullaje
        WHERE p.id_patrullaje = $1 AND p.id_proyecto = $2;
    `;

    const resVerificar = await poolDb.query(queryVerificarEstado, [id_patrullaje, id_proyecto]);

    if (resVerificar.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El patrullaje solicitado no existe en este proyecto.",
            datos: null
        };
    }

    if (resVerificar.rows[0].id_ejecucion !== null) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "No se puede modificar un patrullaje que ya se encuentra en curso o finalizado.",
            datos: null
        };
    }

    const cliente = await poolDb.connect();

    try {
        await cliente.query("BEGIN");

        const queryActualizarPlanificacion = `
            UPDATE planificacion_patrullaje
            SET hora_inicio = $1,
                hora_termino = $2,
                zona = ST_GeomFromText($3, 4326)
            WHERE id_patrullaje = $4 AND id_proyecto = $5
            RETURNING id_patrullaje, hora_inicio, hora_termino, ST_AsGeoJSON(zona)::json AS zona, id_proyecto;
        `;

        const resActualizacion = await cliente.query(queryActualizarPlanificacion, [
            hora_inicio,
            hora_termino,
            zona,
            id_patrullaje,
            id_proyecto
        ]);

        const planificacionActualizada = resActualizacion.rows[0];

        const queryEliminarAsignadosAnteriores = `
            DELETE FROM realizacion_patrullaje
            WHERE id_patrullaje = $1;
        `;
        await cliente.query(queryEliminarAsignadosAnteriores, [id_patrullaje]);

        const queryAsignarNuevosPatrulleros = `
            INSERT INTO realizacion_patrullaje (rut, id_patrullaje)
            SELECT unnest($1::varchar[]), $2;
        `;
        await cliente.query(queryAsignarNuevosPatrulleros, [patrulleros, id_patrullaje]);

        await cliente.query("COMMIT");

        return {
            exito: true,
            codHTTP: 200,
            explicacion: "Planificación de patrullaje actualizada correctamente.",
            datos: {
                ...planificacionActualizada,
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

export const eliminarPlanificacionPatrullaje = async (id_proyecto: string, id_patrullaje: number): Promise<respuestaServices> => {
    
    const queryVerificarEstado = `
        SELECT 
            p.id_patrullaje,
            e.id_patrullaje AS id_ejecucion
        FROM planificacion_patrullaje p
        LEFT JOIN ejecucion_patrullaje e ON p.id_patrullaje = e.id_patrullaje
        WHERE p.id_patrullaje = $1 AND p.id_proyecto = $2;
    `;

    const resVerificar = await poolDb.query(queryVerificarEstado, [id_patrullaje, id_proyecto]);

    if (resVerificar.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El patrullaje solicitado no existe en este proyecto.",
            datos: null
        };
    }

    if (resVerificar.rows[0].id_ejecucion !== null) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "No se puede eliminar un patrullaje que ya se encuentra en curso o finalizado.",
            datos: null
        };
    }

    const queryEliminarPatrullaje = `
        DELETE FROM planificacion_patrullaje 
        WHERE id_patrullaje = $1 AND id_proyecto = $2
    `;

    await poolDb.query(queryEliminarPatrullaje,[id_patrullaje, id_proyecto]);

    return {
            exito: true,
            codHTTP: 200,
            explicacion: "Planificación de patrullaje eliminada correctamente.",
            datos: null
        };
};

export const iniciarPatrullaje = async (datosInicio: tipoIniciarPatrullaje): Promise<respuestaServices> => {
    
    const { id_proyecto, id_patrullaje, rut_usuario, id_vehiculo, eq_personal } = datosInicio;

    const queryVerificarEstado = `
        SELECT 
            p.id_patrullaje,
            e.id_patrullaje AS id_ejecucion
        FROM planificacion_patrullaje p
        LEFT JOIN ejecucion_patrullaje e ON p.id_patrullaje = e.id_patrullaje
        WHERE p.id_patrullaje = $1 AND p.id_proyecto = $2;
    `;

    const resVerificar = await poolDb.query(queryVerificarEstado, [id_patrullaje, id_proyecto]);

    if (resVerificar.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El patrullaje solicitado no existe en este proyecto.",
            datos: null
        };
    }

    if (resVerificar.rows[0].id_ejecucion !== null) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "Este patrullaje ya fue iniciado o finalizado.",
            datos: null
        };
    }

    const queryVerificarAsignacion = `
        SELECT rut
        FROM realizacion_patrullaje
        WHERE id_patrullaje = $1 AND rut = $2;
    `;
    const resAsignacion = await poolDb.query(queryVerificarAsignacion, [id_patrullaje, rut_usuario]);

    if (resAsignacion.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 403,
            explicacion: "No tienes permiso para iniciar este patrullaje porque no estás asignado a él.",
            datos: null
        };
    }

    const cliente = await poolDb.connect();

    try {
        await cliente.query("BEGIN");

        const queryInsertarEjecucion = `
            INSERT INTO ejecucion_patrullaje (id_patrullaje, hora_real_inicio, hora_real_termino, id_vehiculo)
            VALUES ($1, CURRENT_TIMESTAMP, NULL, $2)
            RETURNING id_patrullaje, hora_real_inicio, hora_real_termino, id_vehiculo;
        `;
        const resEjecucion = await cliente.query(queryInsertarEjecucion, [id_patrullaje, id_vehiculo]);
        const ejecucionIniciada = resEjecucion.rows[0];

        if (eq_personal.length > 0) {
            const queryInsertarEquipamiento = `
                INSERT INTO uso_eq_personal (id_patrullaje, id_eq_personal)
                SELECT $1, unnest($2::varchar[]);
            `;
            await cliente.query(queryInsertarEquipamiento, [id_patrullaje, eq_personal]);
        }

        await cliente.query("COMMIT");

        return {
            exito: true,
            codHTTP: 201,
            explicacion: "Patrullaje iniciado correctamente.",
            datos: {
                ...ejecucionIniciada,
                eq_personal
            }
        };
    } catch (error) {
        await cliente.query("ROLLBACK");
        throw error;
    } finally {
        cliente.release();
    }
};

export const finalizarPatrullaje = async (id_proyecto: number, id_patrullaje: number, rut_usuario: string ): Promise<respuestaServices> => {
    
    const queryVerificarEstado = `
        SELECT 
            p.id_patrullaje,
            e.id_patrullaje AS id_ejecucion,
            e.hora_real_termino
        FROM planificacion_patrullaje p
        LEFT JOIN ejecucion_patrullaje e ON p.id_patrullaje = e.id_patrullaje
        WHERE p.id_patrullaje = $1 AND p.id_proyecto = $2;
    `;
    const resVerificar = await poolDb.query(queryVerificarEstado, [id_patrullaje, id_proyecto]);

    if (resVerificar.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El patrullaje solicitado no existe en este proyecto.",
            datos: null
        };
    }

    const estadoActual = resVerificar.rows[0];

    if (estadoActual.id_ejecucion === null) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "No se puede finalizar un patrullaje que aún no ha sido iniciado.",
            datos: null
        };
    }

    if (estadoActual.hora_real_termino !== null) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "Este patrullaje ya fue finalizado anteriormente.",
            datos: null
        };
    }

    const queryVerificarAsignacion = `
        SELECT rut
        FROM realizacion_patrullaje
        WHERE id_patrullaje = $1 AND rut = $2;
    `;
    const resAsignacion = await poolDb.query(queryVerificarAsignacion, [id_patrullaje, rut_usuario]);

    if (resAsignacion.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 403,
            explicacion: "No tienes permiso para finalizar este patrullaje porque no estás asignado a él.",
            datos: null
        };
    }

    const queryFinalizar = `
        UPDATE ejecucion_patrullaje
        SET hora_real_termino = CURRENT_TIMESTAMP
        WHERE id_patrullaje = $1
        RETURNING id_patrullaje, hora_real_inicio, hora_real_termino, id_vehiculo;
    `;
    const resFinalizar = await poolDb.query(queryFinalizar, [id_patrullaje]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Patrullaje finalizado correctamente.",
        datos: resFinalizar.rows[0]
    };
};