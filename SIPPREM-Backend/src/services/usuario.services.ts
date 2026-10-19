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

export const obtenerUsuario = async (id_user : string) : Promise<respuestaServices> => {

    const queryObtenerUser = `
        SELECT us.rut, us.nombre, us.correo, us.telefono, us.foto, r.tipo_rol
        FROM usuario us
        INNER JOIN rol r USING(id_rol)
        WHERE us.rut = $1 OR us.correo = $1
    `;

    const resQuery = await poolDb.query(queryObtenerUser, [id_user]);

    if(resQuery.rows.length === 0 ){
        return {
            exito: false, 
            codHTTP: 404,
            explicacion : `El usuario con id ${id_user} no se encontro.`,
            datos : null
        };
    };
    const usuario = resQuery.rows[0];
    const usuarioConFoto = {
        ...usuario,
        foto: usuario.foto
            ? `data:image/jpeg;base64,${Buffer.from(usuario.foto).toString("base64")}`
            : null
    };

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Se encontraron los datos del usuario.",
        datos : usuarioConFoto
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

    const resQuery = await poolDb.query(queryCrearUsuario,[usuarioNuevo.rut,usuarioNuevo.nombre,usuarioNuevo.correo,telefono,fotoFormateada,claveAleatoriaEncriptada,usuarioNuevo.id_rol]);

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

    const resQuery = await poolDb.query(queryEliminarUsuario,[id_user]);

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

/*export const actualizarUsuario = async (id_user: string, usuarioModificado: tipoUsuario, reestablecerClave : boolean) : Promise<respuestaServices> => {
    
    const fotoFormateada = usuarioModificado.foto 
        ? Buffer.from(usuarioModificado.foto.replace(/^data:image\/\w+;base64,/, ""), "base64")
        : null;
    const telefono = usuarioModificado.telefono || null;

    let cambiarNuevoUser = "";
    if(reestablecerClave){
        const claveAleatoria = crypto.randomBytes(6).toString("hex");
        const claveAleatoriaEncriptada = await bcrypt.hash(claveAleatoria,10);
        cambiarNuevoUser = `,hash_contrasenia = ${claveAleatoriaEncriptada}, nuevo_user = true`;
    };

    const queryActualizarUsuario = `
        UPDATE usuario
        SET nombre = $1,
            correo = $2,
            telefono = $3,
            foto = $4
            ${cambiarNuevoUser}
            
    `;

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "El usuario se elimino exitosamente.",
        datos : null
    };
};*/