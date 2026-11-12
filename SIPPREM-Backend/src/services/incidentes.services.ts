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
    fotografias: string[];
}

export const obtenerIncidentes = async (id_proyecto: number): Promise<respuestaServices> => {

    const query = `
        SELECT 
            i.id_incidente, 
            i.observaciones, 
            i.fecha_hora, 
            ST_AsGeoJSON(i.ubicacion)::json as ubicacion, 
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
            ST_AsGeoJSON(i.ubicacion)::json as ubicacion, 
            i.nivel_gravedad, 
            i.id_patrullaje, 
            ci.categoria
        FROM incidente i
        INNER JOIN ejecucion_patrullaje ep ON i.id_patrullaje = ep.id_patrullaje
        INNER JOIN planificacion_patrullaje pp ON ep.id_patrullaje = pp.id_patrullaje
        INNER JOIN categoria_incidente ci ON i.id_categoria_incidente = ci.id_categoria_incidente
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

    const queryFotos = `
        SELECT foto
        FROM foto_incidente
        WHERE id_incidente = $1
        ORDER BY id_foto ASC;
    `;

    const resultadoFotos = await poolDb.query(queryFotos, [id_incidente]);

    const fotosFormateadas: string[] = resultadoFotos.rows.map(
        (fila) => `data:image/jpeg;base64,${Buffer.from(fila.foto).toString("base64")}`
    );

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Incidente encontrado correctamente.",
        datos: {
            incidente: resultado.rows[0],
            fotos: fotosFormateadas
        }
    };
};

export const crearIncidente = async (datos: NuevoIncidente, rutUser: string): Promise<respuestaServices> => {
    const {id_proyecto, id_patrullaje, id_categoria_incidente, nivel_gravedad, observaciones, ubicacion, fotografias} = datos;

    const queryPatrullaje = `
        SELECT pp.id_patrullaje, rp.rut 
        FROM planificacion_patrullaje pp
        INNER JOIN realizacion_patrullaje rp USING (id_patrullaje)
        WHERE pp.id_patrullaje = $1 AND pp.id_proyecto = $2;
    `;
    const patrullaje = await poolDb.query(queryPatrullaje, [id_patrullaje, id_proyecto]);

    if (patrullaje.rows.length === 0) {
        return {
            exito: false, 
            codHTTP: 404,
            explicacion: "El patrullaje indicado no existe en ese proyecto.",
            datos: null
        };
    }

    const esPatrulleroAsignado = patrullaje.rows.some(
        (patrullero: any) => patrullero.rut === rutUser.toLowerCase()
    );

    if (!esPatrulleroAsignado){
        return {
            exito: false, 
            codHTTP: 403,
            explicacion: "No puedes crear un incidente en un patrullaje que no estas realizando tu.",
            datos: null
        };
    }

    const fotosFormateadas: Buffer[] = fotografias
        .map((foto) => Buffer.from(foto.replace(/^data:image\/\w+;base64,/, ""), "base64"))
        .filter((buf) => buf.length > 0);

    const cliente = await poolDb.connect();

    try {
        await cliente.query("BEGIN");

        const queryIncidente = `
            INSERT INTO incidente (observaciones, fecha_hora, ubicacion, nivel_gravedad, id_patrullaje, id_categoria_incidente)
            VALUES ($1, CURRENT_TIMESTAMP, ST_GeomFromText($2, 4326), $3, $4, $5)
            RETURNING id_incidente, observaciones, fecha_hora, nivel_gravedad, id_patrullaje, id_categoria_incidente;
        `;

        const resultadoIncidente = await cliente.query(queryIncidente, [
            observaciones,
            ubicacion,
            nivel_gravedad,
            id_patrullaje,
            id_categoria_incidente
        ]);

        const nuevoIncidenteRegistrado = resultadoIncidente.rows[0];
        const idGenerado = nuevoIncidenteRegistrado.id_incidente;

        if (fotosFormateadas.length > 0) {
            const queryFotos = `
                INSERT INTO foto_incidente (foto, id_incidente)
                SELECT unnest($1::bytea[]), $2;
            `;
            await cliente.query(queryFotos, [fotosFormateadas, idGenerado]);
        }

        await cliente.query("COMMIT");

        return {
            exito: true, 
            codHTTP: 201,
            explicacion: "Incidente reportado correctamente.",
            datos: nuevoIncidenteRegistrado
        };
    } catch (error) {
        await cliente.query("ROLLBACK");
        throw error;
    } finally {
        cliente.release();
    }
};
