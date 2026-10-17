import { poolDb } from "../config/db.js";
import bcrypt from "bcrypt";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

export const obtenerUsuarios = async (estado? : string) : Promise<respuestaServices> => {

    let condicionEliminados = "WHERE eliminado = false";
    if (estado && estado === "eliminados"){
       condicionEliminados = "WHERE eliminado = true"; 
    }else if(estado && estado === "todos"){
        condicionEliminados = "";
    };

    const queryObtenerUsers = `
        SELECT us.rut, us.nombre, us.correo, us.telefono, us.foto, r.tipo_rol
        FROM usuario us
        INNER JOIN rol r USING(id_rol)
        ${condicionEliminados}
        ORDER BY us.nombre
    `;

    const resQuery = await poolDb.query(queryObtenerUsers);
    const usuarios = resQuery.rows;

    const usuariosConFoto = usuarios.map((user)=>({
        ...user,
        foto: user.foto
            ? `data:image/jpeg;base64,${Buffer.from(user.foto).toString("base64")}`
            : null
    }));

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Usuarios obtenidos correctamente.",
        datos: usuariosConFoto
    };
} 

export const obtenerUsuario = async (id_user : string) => {

    const queryObtenerUser = `
        SELECT us.rut, us.nombre, us.correo, us.telefono, us.foto, r.tipo_rol
        FROM usuario us
        INNER JOIN rol r USING(id_rol)
        WHERE us.rut = $1 OR us.correo = $1
    `;

    const resQuery = await poolDb.query(queryObtenerUser, [id_user]);

    if(resQuery.rows.length === 0 ){
        return {
            exito: true, 
            codHTTP: 200,
            explicacion : `El usuario con id ${id_user} no se encontro.`,
            datos : resQuery.rows[0]
        };
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se encontraron los datos del usuario.",
        datos : resQuery.rows[0]
    };
};