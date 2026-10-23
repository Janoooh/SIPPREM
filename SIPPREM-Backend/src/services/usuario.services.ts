import { poolDb } from "../config/db.js";
import bcrypt from "bcrypt";
import type { respuestaServices } from "../interfaces/respuestaServices.js";
import crypto from "crypto";

interface tipoUsuario{
    rut: string,
    nombre: string,
    correo: string,
    telefono?: string | null,
    foto?: string | null,
    id_rol: number
};

export const obtenerUsuarios = async (estado? : string) : Promise<respuestaServices> => {

    let condicionEliminados = "WHERE eliminado = false";
    if (estado && estado === "eliminados"){
       condicionEliminados = "WHERE eliminado = true"; 
    }else if(estado && estado === "todos"){
        condicionEliminados = "";
    };

    const queryObtenerUsers = `
        SELECT us.rut, us.nombre, us.correo, us.telefono, us.foto, r.tipo_rol, us.eliminado
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

export const obtenerUsuario = async (id_user : string) : Promise<respuestaServices> => {

    const queryObtenerUser = `
        SELECT us.rut, us.nombre, us.correo, us.telefono, us.foto, r.id_rol, r.tipo_rol, us.fecha_registro
        FROM usuario us
        INNER JOIN rol r USING(id_rol)
        WHERE us.rut = $1 OR us.correo = $1
    `;

    const resQuery = await poolDb.query(queryObtenerUser, [id_user.toLowerCase()]);

    if(resQuery.rows.length === 0 ){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : `El usuario con id ${id_user} no se encontro.`,
            datos : null
        };
    };
    const user = resQuery.rows[0];
    const infoUsuario = {
        ...user,
        foto: user.foto
            ? `data:image/jpeg;base64,${Buffer.from(user.foto).toString("base64")}`
            : null
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se encontraron los datos del usuario.",
        datos : infoUsuario
    };
};

export const obtenerProyectosDeUsuario = async (id_user: string): Promise<respuestaServices> => {

    const queryBuscarUser = `
        SELECT rut
        FROM usuario
        WHERE rut = $1
    `;

    const resBuscarUsuario = await poolDb.query(queryBuscarUser,[id_user.toLowerCase()]);

    if (resBuscarUsuario.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : `El usuario con id ${id_user} no se encontro.`,
            datos : null
        };
    };

    const queryProyectosUsuario = `
        SELECT proy.id_proyecto, proy.nombre_proyecto
        FROM acceso_proyecto acs
        INNER JOIN proyecto_patrullaje proy USING(id_proyecto)
        WHERE acs.rut = $1
    `;

    const resConsultaProyectos = await poolDb.query(queryProyectosUsuario,[id_user.toLowerCase()]);
    const proyectosUsuario = resConsultaProyectos.rows;

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se encontraron los proyectos del usuario.",
        datos : proyectosUsuario
    }; 
};

export const crearUsuario = async (usuarioNuevo: tipoUsuario) : Promise<respuestaServices> => {

    const fotoFormateada = usuarioNuevo.foto 
        ? Buffer.from(usuarioNuevo.foto.replace(/^data:image\/\w+;base64,/, ""), "base64")
        : null;
    const telefono = usuarioNuevo.telefono || null;

    const claveAleatoria = crypto.randomBytes(6).toString("hex");
    const claveAleatoriaEncriptada = await bcrypt.hash(claveAleatoria,10);

    const queryCrearUsuario = `
        INSERT INTO usuario (rut,nombre,correo,telefono,foto,hash_contrasenia,nuevo_user,fecha_registro,eliminado,id_rol)
        VALUES ($1,$2,$3,$4,$5,$6,true,CURRENT_TIMESTAMP,false,$7)
        RETURNING rut, nombre, correo, telefono, foto, id_rol
    `;

    const resQuery = await poolDb.query(queryCrearUsuario,[usuarioNuevo.rut.toLowerCase(),usuarioNuevo.nombre,usuarioNuevo.correo.toLowerCase(),telefono,fotoFormateada,claveAleatoriaEncriptada,usuarioNuevo.id_rol]);

    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "El usuario se creo exitosamente.",
        datos : claveAleatoria
    };
};

export const eliminarUsuario = async (id_user: string) : Promise<respuestaServices> => {

    const queryEliminarUsuario = `
        UPDATE usuario
        SET eliminado = true
        WHERE rut = $1 OR correo = $1
        RETURNING rut, nombre
    `;

    const resQuery = await poolDb.query(queryEliminarUsuario,[id_user.toLowerCase()]);

    if(resQuery.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : `El usuario con id ${id_user} no se encontro.`,
            datos : null
        };
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "El usuario se elimino exitosamente.",
        datos : null
    };
};

export const actualizarUsuario = async (usuarioModificado: tipoUsuario) : Promise<respuestaServices> => {

    const id_user = usuarioModificado.rut;

    const fotoFormateada = usuarioModificado.foto 
        ? Buffer.from(usuarioModificado.foto.replace(/^data:image\/\w+;base64,/, ""), "base64")
        : null;
    const telefono = usuarioModificado.telefono || null;

    const queryActualizarUsuario = `
        UPDATE usuario
        SET nombre = $1,
            correo = $2,
            telefono = $3,
            foto = $4,
            id_rol = $5
        WHERE (rut = $6 OR correo = $6) AND eliminado = false
        RETURNING rut
    `;

    const resQuery = await poolDb.query(queryActualizarUsuario,[usuarioModificado.nombre,usuarioModificado.correo.toLowerCase(),telefono,fotoFormateada,usuarioModificado.id_rol,id_user.toLowerCase()]);

    if (resQuery.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : "El usuario a modificar no se encontro.",
            datos : null
        };    
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "El usuario se modifico exitosamente.",
        datos : null
    };
};

export const reestablecerClave = async (id_user: string): Promise<respuestaServices> => {

    const claveAleatoria = crypto.randomBytes(6).toString("hex");
    const nuevoHash = await bcrypt.hash(claveAleatoria,10);

    const queryReestablecerClave = `
        UPDATE usuario
        SET hash_contrasenia = $1,
            nuevo_user = true
        WHERE (rut = $2 OR correo = $2) AND eliminado = false
        RETURNING rut
    `;

    const resQuery = await poolDb.query(queryReestablecerClave, [nuevoHash,id_user.toLowerCase()]);

    if (resQuery.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : "El usuario no se encontro.",
            datos : null
        }; 
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se reestablecio correctamente la clave del usuario.",
        datos : claveAleatoria
    };
};

export const restaurarUsuario = async (id_user: string): Promise<respuestaServices> => {

    const queryRestaurarUsuario = `
        UPDATE usuario
        SET eliminado = false
        WHERE (rut = $1 OR correo = $1)
        RETURNING rut
    `;

    const resQuery = await poolDb.query(queryRestaurarUsuario,[id_user.toLowerCase()]);

    if (resQuery.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : "El usuario no se encontro.",
            datos : null
        }; 
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se restauro correctamente el usuario.",
        datos : null
    };
};