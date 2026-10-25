import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Obtener todos los proyectos activos y no eliminados
export const obtenerProyectos = async (): Promise<respuestaServices> => {
    const query = `
        SELECT id_proyecto, nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, ST_AsGeoJSON(zona_seleccionada)::json AS zona_seleccionada, activo
        FROM proyecto_patrullaje
        WHERE eliminado = false
        ORDER BY nombre_proyecto;
    `;

    const resultado = await poolDb.query(query);

    // Si no hay proyectos registrados
    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No hay proyectos registrados para mostrar.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Proyectos obtenidos correctamente.",
        datos: resultado.rows
    };
};

export const obtenerProyectoPorId = async (id: number): Promise<respuestaServices> => {
    const query = `
        SELECT id_proyecto, nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, ST_AsGeoJSON(zona_seleccionada)::json AS zona_seleccionada, activo
        FROM proyecto_patrullaje
        WHERE id_proyecto = $1 AND eliminado = false;
    `;

    const resultado = await poolDb.query(query, [id]);

    // Si no encuentra el proyecto
    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El proyecto solicitado no existe.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Proyecto encontrado correctamente.",
        datos: resultado.rows[0]
    };
};

export const crearProyecto = async (
    nombre_proyecto: string,
    nombre_sector: string,
    presupuesto: number,
    fecha_inicio: string,
    fecha_termino: string,
    zona_seleccionada: any
): Promise<respuestaServices> => {
    const query = `
        INSERT INTO proyecto_patrullaje (nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, zona_seleccionada)
        VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326))
        RETURNING id_proyecto, nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, ST_AsGeoJSON(zona_seleccionada)::json AS zona_seleccionada, activo, eliminado;
    `;

    const resultado = await poolDb.query(query, [
        nombre_proyecto,
        nombre_sector,
        presupuesto,
        fecha_inicio,
        fecha_termino,
        zona_seleccionada
    ]);

    return {
        exito: true,
        codHTTP: 201,
        explicacion: "Proyecto creado correctamente.",
        datos: resultado.rows[0]
    };
};

export const actualizarProyecto = async (
    id: number,
    nombre_proyecto: string,
    nombre_sector: string,
    presupuesto: number | undefined,
    fecha_inicio: string,
    fecha_termino: string,
    zona_seleccionada: any,
    activo: boolean
): Promise<respuestaServices> => {
    // 1. Verificamos si el proyecto existe
    const queryVerificar = `
        SELECT * FROM proyecto_patrullaje 
        WHERE id_proyecto = $1 AND eliminado = false;
    `;
    const proyectoExiste = await poolDb.query(queryVerificar, [id]);

    if (proyectoExiste.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El proyecto no existe o ya fue eliminado.",
            datos: null
        };
    }

    // 2. Ejecutamos la actualización
    const queryActualizar = `
        UPDATE proyecto_patrullaje
        SET nombre_proyecto = $1,
            nombre_sector = $2,
            presupuesto = $3,
            fecha_inicio = $4,
            fecha_termino = $5,
            zona_seleccionada = ST_GeomFromText($6, 4326),
            activo = $7
        WHERE id_proyecto = $8
        RETURNING id_proyecto, nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, ST_AsGeoJSON(zona_seleccionada)::json AS zona_seleccionada, activo, eliminado;
    `;

    const resultado = await poolDb.query(queryActualizar, [
        nombre_proyecto,
        nombre_sector,
        presupuesto,
        fecha_inicio,
        fecha_termino,
        zona_seleccionada,
        activo,
        id
    ]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Proyecto actualizado correctamente.",
        datos: resultado.rows[0]
    };
};

export const eliminarProyecto = async (id: number): Promise<respuestaServices> => {
    const query = `
        UPDATE proyecto_patrullaje 
        SET eliminado = true
        WHERE id_proyecto = $1 AND eliminado = false
        RETURNING id_proyecto, nombre_proyecto, nombre_sector, presupuesto, fecha_inicio, fecha_termino, ST_AsGeoJSON(zona_seleccionada)::json AS zona_seleccionada, activo, eliminado;
    `;

    const resultado = await poolDb.query(query, [id]);

    if (!resultado.rows[0]) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El proyecto no existe o ya fue eliminado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Proyecto eliminado correctamente.",
        datos: resultado.rows[0]
    };
};