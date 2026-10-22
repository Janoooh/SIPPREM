import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Interfaz interna para tipar los datos de entrada al crear un incidente
interface NuevoIncidente {
    id_proyecto: number;
    id_patrullaje: number;
    id_categoria_incidente: number;
    nivel_gravedad: number;
    observaciones: string;
    ubicacion: string; // Formato WKT ej: 'POINT(-70.6565 -33.4435)'
    fotografia: string | null;
}

export const obtenerIncidentes = async (id_proyecto: number): Promise<respuestaServices> => {
    const queryProyecto = `
        SELECT id_proyecto 
        FROM proyecto_patrullaje
        WHERE id_proyecto = $1 AND eliminado = false;
    `;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0) {
        return {
            exito: false, 
            codHTTP: 404,
            explicacion: "Ese proyecto no existe.",
            datos: null
        };
    }

    const query = `
        SELECT 
            i.id_incidente, 
            i.observaciones, 
            i.fecha_hora, 
            ST_AsText(i.ubicacion) as ubicacion, 
            i.nivel_gravedad, 
            i.id_patrullaje, 
            ci.categoria
        FROM incidente i
        INNER JOIN ejecucion_patrullaje ep ON i.id_patrullaje = ep.id_patrullaje
        INNER JOIN planificacion_patrullaje pp ON ep.id_patrullaje = pp.id_patrullaje
        INNER JOIN categoria_incidente ci ON i.id_categoria_incidente = ci.id_categoria_incidente
        WHERE pp.id_proyecto = $1;
    `;

    const resultado = await poolDb.query(query, [id_proyecto]);

    if (resultado.rows.length === 0) {
        return {
            exito: false, 
            codHTTP: 404,
            explicacion: "No hay incidentes registrados para este proyecto.",
            datos: null
        };
    }

    return {
        exito: true, 
        codHTTP: 200,
        explicacion: "Incidentes obtenidos correctamente.",
        datos: resultado.rows
    };
};

export const obtenerIncidentePorId = async (id_proyecto: number, id_incidente: string): Promise<respuestaServices> => {
    const query = `
        SELECT 
            i.id_incidente, 
            i.observaciones, 
            i.fecha_hora, 
            ST_AsText(i.ubicacion) as ubicacion, 
            i.nivel_gravedad, 
            i.id_patrullaje, 
            ci.categoria,
            f.foto
        FROM incidente i
        INNER JOIN ejecucion_patrullaje ep ON i.id_patrullaje = ep.id_patrullaje
        INNER JOIN planificacion_patrullaje pp ON ep.id_patrullaje = pp.id_patrullaje
        INNER JOIN categoria_incidente ci ON i.id_categoria_incidente = ci.id_categoria_incidente
        LEFT JOIN foto_incidente f ON i.id_incidente = f.id_incidente
        WHERE pp.id_proyecto = $1 AND i.id_incidente = $2;
    `;

    const resultado = await poolDb.query(query, [id_proyecto, id_incidente]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Incidente no encontrado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Incidente encontrado correctamente.",
        datos: resultado.rows[0]
    };
};

export const crearIncidente = async (datos: NuevoIncidente): Promise<respuestaServices> => {
    const {id_proyecto, id_patrullaje, id_categoria_incidente, nivel_gravedad, observaciones, ubicacion, fotografia} = datos;

    const queryProyecto = `SELECT id_proyecto FROM proyecto_patrullaje WHERE id_proyecto = $1 AND eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0) {
        return {
            exito: false, 
            codHTTP: 404,
            explicacion: "Ese proyecto no existe.",
            datos: null
        };
    }

    const queryPatrullaje = `
        SELECT id_patrullaje 
        FROM planificacion_patrullaje 
        WHERE id_patrullaje = $1 AND id_proyecto = $2;
    `;
    const patrullaje = await poolDb.query(queryPatrullaje, [id_patrullaje, id_proyecto]);

    if (patrullaje.rows.length === 0) {
        return {
            exito: false, 
            codHTTP: 404,
            explicacion: "El patrullaje indicado no existe o no pertenece a este proyecto.",
            datos: null
        };
    }

    const queryIncidente = `
        INSERT INTO incidente (observaciones, fecha_hora, ubicacion, nivel_gravedad, id_patrullaje, id_categoria_incidente)
        VALUES ($1, CURRENT_TIMESTAMP, ST_GeomFromText($2, 4326), $3, $4, $5)
        RETURNING id_incidente, observaciones, fecha_hora, nivel_gravedad, id_patrullaje, id_categoria_incidente;
    `;

    const resultadoIncidente = await poolDb.query(queryIncidente, [
        observaciones,
        ubicacion,
        nivel_gravedad,
        id_patrullaje,
        id_categoria_incidente
    ]);

    const nuevoIncidenteRegistrado = resultadoIncidente.rows[0];
    const idGenerado = nuevoIncidenteRegistrado.id_incidente;

    if (fotografia) {
        const queryFoto = `
            INSERT INTO foto_incidente (foto, id_incidente)
            VALUES ($1, $2);
        `;
        await poolDb.query(queryFoto, [fotografia, idGenerado]);
    }

    return {
        exito: true, 
        codHTTP: 201,
        explicacion: "Incidente reportado correctamente.",
        datos: nuevoIncidenteRegistrado
    };
};