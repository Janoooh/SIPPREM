import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Obtener todas las actividades de un proyecto específico
export const obtenerActividadesPorProyecto = async (id_proyecto: number): Promise<respuestaServices> => {
    // verificar si el proyecto existe y si no esta eliminado
    const queryProyecto = `
    SELECT id_proyecto
    FROM proyecto_patrullaje
    WHERE id_proyecto = $1 AND eliminado = false;
    `;
const resProyecto = await poolDb.query(queryProyecto, [id_proyecto]);

//si el proyecto no existe o esta eliminado
if(resProyecto.rows.length === 0){
    return{
        exito: false,
        codHTTP: 404,
        explicacion: "El proyecto no existe o ha sido eliminado.",
        datos: null
    };
}
// Obtenemos las actividades no eliminadas asociadas a ese proyecto 
const queryActividades = `
        SELECT id_actividad, titulo, fecha, descripcion, id_proyecto 
        FROM actividad
        WHERE id_proyecto = $1 AND eliminado = false
        ORDER BY fecha ASC;
`;
const resActividades = await poolDb.query(queryActividades, [id_proyecto]);

// en caso de exito
return {
        exito: true,
        codHTTP: 200,
        explicacion: "Actividades obtenidas correctamente.",
        datos: resActividades.rows
    };
};


// Crear una nueva activadad 
export const crearActividad = async (titulo: string, fecha: string, descripcion: string, id_proyecto: number): Promise<respuestaServices> => {
    // verificar si el proyecto existe y si no esta eliminado
    const queryProyecto = `
        SELECT id_proyecto 
        FROM proyecto_patrullaje 
        WHERE id_proyecto = $1 AND eliminado = false;
    `;
    const resProyecto = await poolDb.query(queryProyecto, [id_proyecto]);

    if (resProyecto.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede crear la actividad: el proyecto no existe o ha sido eliminado.",
            datos: null
        };
    }

    // se agrega la nueva actividad 
    const queryInsert = `
        INSERT INTO actividad (titulo, fecha, descripcion, id_proyecto)
        VALUES ($1, $2, $3, $4)
        RETURNING id_actividad, titulo, fecha, descripcion, id_proyecto, eliminado;
    `;
    const resultado = await poolDb.query(queryInsert, [titulo, fecha, descripcion, id_proyecto]);

    //Retorno exitoso(código 201)
    return {
        exito: true,
        codHTTP: 201,
        explicacion: "Actividad creada exitosamente.",
        datos: resultado.rows[0]
    };
};

// Actualizar una actividad existente
export const actualizarActividad = async (
    titulo: string,
    fecha: string,
    descripcion: string,
    id_actividad: number
) : Promise<respuestaServices> => {
    const query = `
        UPDATE actividad
        SET titulo= $1, fecha=$2, descripcion=$3
        WHERE id_actividad = $4 AND eliminado = false
        RETURNING id_actividad, titulo, fecha, descripcion, id_proyecto, eliminado;
    `; 
    const resultado = await poolDb.query(query, [titulo, fecha, descripcion, id_actividad]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se pudo actualizar la actividad: no existe o ha sido eliminada.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Actividad actualizada exitosamente.",
        datos: resultado.rows[0]
    };
};


// Eliminar actividad (Soft Delete)
export const eliminarActividad = async (id_actividad: number): Promise<respuestaServices> => {
    // Validamos que la actividad exista y no esté ya eliminada
    const consultaExistencia = `
        SELECT id_actividad 
        FROM actividad 
        WHERE id_actividad = $1 AND eliminado = false;
    `;
    const resultadoExistencia = await poolDb.query(consultaExistencia, [id_actividad]);

    if (resultadoExistencia.rowCount === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede eliminar la actividad: la actividad no existe o ya ha sido eliminada.",
            datos: null
        };
    }

    // Realizamos el borrado
    const consultaEliminar = `
        UPDATE actividad
        SET eliminado = true
        WHERE id_actividad = $1
        RETURNING id_actividad, titulo, descripcion, eliminado;
    `;
    const resultadoEliminacion = await poolDb.query(consultaEliminar, [id_actividad]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Actividad eliminada exitosamente.",
        datos: resultadoEliminacion.rows[0]
    };
};