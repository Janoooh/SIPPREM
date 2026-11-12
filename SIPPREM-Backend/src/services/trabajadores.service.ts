import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// buscar Trabajadores de un proyecto 
export const obtenerTrabajadoresProyecto = async (id_proyecto: number): Promise<respuestaServices> => {

  const query = `
        SELECT usuario.rut,usuario.nombre,usuario.correo,usuario.telefono,rol.tipo_rol
        FROM acceso_proyecto
        INNER JOIN usuario ON acceso_proyecto.rut = usuario.rut
        INNER JOIN rol ON usuario.id_rol = rol.id_rol
        WHERE acceso_proyecto.id_proyecto = $1 
        AND usuario.eliminado = false
        ORDER BY usuario.nombre ASC
    `;

    const resultado = await poolDb.query(query, [id_proyecto]);

    return {
      exito: true,
      codHTTP: 200,
      explicacion: "Trabajadores del proyecto obtenidos exitosamente.",
      datos: resultado.rows
    };
}; 

export const obtenerTrabajadoresDisponibles = async (id_proyecto: number, rolUser: string, rutUser: string): Promise<respuestaServices> => {

    let id_rol_user = 1;

    if (rolUser.toLowerCase() === "supervisor")
        id_rol_user = 2;

    const queryObtenerTrabajadoresDisponibles = `
        SELECT us.rut, us.nombre, r.tipo_rol
        FROM usuario us
        INNER JOIN rol r USING (id_rol)
        WHERE us.eliminado = false AND us.id_rol > $1 AND us.rut != $2 
            AND us.rut NOT IN (
                SELECT rut
                FROM acceso_proyecto
                WHERE id_proyecto = $3
            )
        ORDER BY us.nombre ASC
    `;

    const resQuery = await poolDb.query(queryObtenerTrabajadoresDisponibles, [id_rol_user, rutUser.toLowerCase(), id_proyecto]);

    return {
      exito: true,
      codHTTP: 200,
      explicacion: "Trabajadores disponibles del proyecto obtenidos exitosamente.",
      datos: resQuery.rows
    };
};


// Asignar un trabajador a un proyecto 
export const asignarTrabajadorProyecto = async (rut: string, id_proyecto: number, rolUser: string): Promise<respuestaServices> => {
    
    // Validamos que el usuario exista y esté activo
    const queryUsuario = `
        SELECT rut, nombre, id_rol
        FROM usuario 
        WHERE rut = $1 AND eliminado = false;
    `;
    const resUsuario = await poolDb.query(queryUsuario, [rut.toLowerCase()]);

    if (resUsuario.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede asignar el trabajador: el usuario no existe o ha sido eliminado.",
            datos: null
        };
    }

    if (resUsuario.rows[0].id_rol === 1) {
        return {
            exito: false,
            codHTTP: 403,
            explicacion: "No se puede asignar un administrador al proyecto, ya poseen acceso total.",
            datos: null
        };
    }

    if (rolUser.toLowerCase() === "supervisor" && resUsuario.rows[0].id_rol <= 2){
        return {
            exito: false,
            codHTTP: 403,
            explicacion: "No se puede asignar al trabajador: Solo puedes asignar patrulleros, no supervisores.",
            datos: null
        };
    }

    // insertamos el trabajador al proyecto
    const queryInsert = `
        INSERT INTO acceso_proyecto (rut, id_proyecto)
        VALUES ($1, $2)
        ON CONFLICT (rut, id_proyecto) DO NOTHING
        RETURNING rut, id_proyecto;
    `;
    const resultado = await poolDb.query(queryInsert, [rut.toLowerCase(), id_proyecto]);

    if (resultado.rows.length === 0){
        return {
            exito: false,
            codHTTP: 409,
            explicacion: "El trabajador ya se encuentra asignado a este proyecto.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 201,
        explicacion: "Trabajador asignado al proyecto exitosamente.",
        datos: resultado.rows[0]
    };
};

// Sacar un trabajador de un proyecto
export const sacarTrabajadorProyecto = async (rut: string, id_proyecto: number, rolUser: string): Promise<respuestaServices> => {
    // Validamos si es que existe en el proyecto
    const queryExiste = `
        SELECT us.rut, us.id_rol
        FROM acceso_proyecto ap 
        INNER JOIN usuario us USING (rut)
        WHERE us.rut = $1 AND ap.id_proyecto = $2;
    `;

    const resExiste = await poolDb.query(queryExiste, [rut.toLowerCase(), id_proyecto]);

    if (resExiste.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "No se puede sacar al trabajador: no se encuentra asignado a este proyecto.",
            datos: null
        };
    }

    if (rolUser.toLowerCase() === "supervisor" && resExiste.rows[0].id_rol <= 2){
        return {
            exito: false,
            codHTTP: 403,
            explicacion: "No se puede sacar al trabajador: Solo puedes quitar patrulleros, no supervisores.",
            datos: null
        };
    }

    // Eliminamos la asignación del proyecto
    const queryDelete = `
        DELETE FROM acceso_proyecto 
        WHERE rut = $1 AND id_proyecto = $2
        RETURNING rut, id_proyecto;
    `;
    const resultado = await poolDb.query(queryDelete, [rut.toLowerCase(), id_proyecto]);

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Trabajador retirado del proyecto exitosamente.",
        datos: resultado.rows[0]
    };
};