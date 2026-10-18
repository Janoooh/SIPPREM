import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// buscar Trabajadores de un proyecto 
export const obtenerTrabajadoresProyecto = async (id_proyecto: number): Promise<respuestaServices> => {
  // validamos que el proyecto exista y no este eliminado
  const queryProyecto = `
    SELECT id_proyecto
    FROM proyecto_patrullaje
    WHERE id_proyecto = $1 AND eliminado = false;
    `;
  const resProyecto = await poolDb.query(queryProyecto, [id_proyecto]);

  if(resProyecto.rowCount === 0) {
    return {
      exito: false,
      codHTTP: 404,
      explicacion: "No se pueden obtener los trabajadores:El proyecto no existe o se ha eliminado.",
      datos: null
    };
  }

  const query = `
        SELECT usuario.rut,usuario.nombre,usuario.correo,usuario.telefono,rol.tipo_rol,acceso_proyecto.es_encargado
        FROM acceso_proyecto
        INNER JOIN usuario ON acceso_proyecto.rut = usuario.rut
        INNER JOIN rol ON usuario.id_rol = rol.id_rol
        WHERE acceso_proyecto.id_proyecto = $1 
        AND usuario.eliminado = false;
    `;

    const resultado = await poolDb.query(query, [id_proyecto]);

    return {
      exito: true,
      codHTTP: 200,
      explicacion: "Trabajadores del proyecto obtenidos exitosamente.",
      datos: resultado.rows
    };
}; 


// Asignar un trabajador a un proyecto 
export const asignarTrabajadorProyecto = async (rut: string,id_proyecto: number,es_encargado: boolean): Promise<respuestaServices> => {
    //  Validamos que el proyecto exista y esté activo
    const queryProyecto = `
        SELECT id_proyecto 
        FROM proyecto_patrullaje 
        WHERE id_proyecto = $1 AND eliminado = false;
    `;
    const resProyecto = await poolDb.query(queryProyecto, [id_proyecto]);

    if (resProyecto.rowCount === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede asignar el trabajador: el proyecto no existe o ha sido eliminado.",
            datos: null
        };
    }

    // Validamos que el usuario exista y esté activo
    const queryUsuario = `
        SELECT rut, nombre 
        FROM usuario 
        WHERE rut = $1 AND eliminado = false;
    `;
    const resUsuario = await poolDb.query(queryUsuario, [rut]);

    if (resUsuario.rowCount === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede asignar el trabajador: el usuario no existe o ha sido eliminado.",
            datos: null
        };
    }

    // Validamosi ya está asignado a este proyecto
    const queryExisteAsignacion = `
        SELECT rut 
        FROM acceso_proyecto 
        WHERE rut = $1 AND id_proyecto = $2;
    `;
    const resExiste = await poolDb.query(queryExisteAsignacion, [rut, id_proyecto]);

    if (resExiste.rowCount && resExiste.rowCount > 0) {
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "El trabajador ya se encuentra asignado a este proyecto.",
            datos: null
        };
    }

    // insertamos el trabajador al proyecto
    const queryInsert = `
        INSERT INTO acceso_proyecto (rut, id_proyecto, es_encargado)
        VALUES ($1, $2, $3)
        RETURNING rut, id_proyecto, es_encargado;
    `;
    const resultado = await poolDb.query(queryInsert, [rut, id_proyecto, es_encargado]);

    return {
        exito: true,
        codHTTP: 201,
        explicacion: "Trabajador asignado al proyecto exitosamente.",
        datos: resultado.rows[0]
    };
};

// Sacar un trabajador de un proyecto
export const sacarTrabajadorProyecto = async (rut: string, id_proyecto: number): Promise<respuestaServices> => {
    // Validamos si es que existe en el proyecto
    const queryExiste = `
        SELECT rut 
        FROM acceso_proyecto 
        WHERE rut = $1 AND id_proyecto = $2;
    `;
    const resExiste = await poolDb.query(queryExiste, [rut, id_proyecto]);

    if (resExiste.rowCount === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede sacar al trabajador: no se encuentra asignado a este proyecto.",
            datos: null
        };
    }

    // Eliminamos la asignación del proyecto
    const queryDelete = `
        DELETE FROM acceso_proyecto 
        WHERE rut = $1 AND id_proyecto = $2
        RETURNING rut, id_proyecto;
    `;
    const resultado = await poolDb.query(queryDelete, [rut, id_proyecto]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Trabajador retirado del proyecto exitosamente.",
        datos: resultado.rows[0]
    };
};