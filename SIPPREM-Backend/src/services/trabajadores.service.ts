import { poolDb } from "../config/db.js";

// buscar Trabajadores de un proyecto 
export const obtenerTrabajadoresProyecto = async (id_proyecto: number)=> {
    const query = `
    SELECT 
    usuario.rut,
    usuario.nombre,
    usuario.correo,
    usuario.telefono,
    rol.tipo_rol,
    acceso_proyecto.es_encargado
    FROM acceso_proyecto
    INNER JOIN usuario ON acceso_proyecto.rut = usuario.rut
    INNER JOIN rol ON usuario.id_rol = rol.id_rol
    WHERE acceso_proyecto.id_proyecto = $1
    `;

    const resultado = await poolDb.query(query,[id_proyecto])
    return resultado.rows;
}

//Crear un trabajador en un proyecto supongo
export const asignarTrabajador = async (rut: string, id_proyecto: number, es_encargado: boolean) => {
  const query = `
    INSERT INTO acceso_proyecto (rut, id_proyecto, es_encargado)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const resultado = await poolDb.query(query, [rut, id_proyecto, es_encargado]);
  return resultado.rows[0];
};