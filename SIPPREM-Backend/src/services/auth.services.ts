import {poolDb} from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

export const iniciarSesion = async (idIngresado : string, claveIngresada: string) : Promise<respuestaServices> => {
    const queryBuscarUser = `
        SELECT us.rut, us.nombre, us.correo, us.nuevo_user, us.id_rol, r.tipo_rol
        FROM usuario us
        INNER JOIN rol r USING (id_rol)
        WHERE (us.rut = $1 OR us.correo = $1) AND us.eliminado = false
    `;

    const resConsulta = await poolDb.query(queryBuscarUser,[idIngresado]);

    // El usuario no se encontro.
    if (resConsulta.rows.length === 0){
        return {
            exito: false, 
            codHTTP: 400,
            explicacion : "Las credenciales de acceso son incorrectas.",
            datos : null
        };
    }

    const datosUsuario = resConsulta.rows[0];
    const hashGuardado = await (await poolDb.query("SELECT hash_contrasenia FROM usuario WHERE rut = $1 OR correo = $1",[idIngresado])).rows[0];

    const comparacionClave = await bcrypt.compare(claveIngresada, hashGuardado.hash_contrasenia);

    // La clave ingresada no es la correcta clave del usuario ingresado.
    if (!comparacionClave){
        return {
            exito: false,
            codHTTP: 401,
            explicacion : "Las credenciales de acceso son incorrectas.",
            datos : null
            };
    }

    const generadorSecret = process.env.JWT_SECRET || "default";
    const token = jwt.sign(
        {
            rutUsuario : datosUsuario.rut,
            correoUsuario : datosUsuario.correo,
            rol : datosUsuario.tipo_rol
        },
        generadorSecret,
        { expiresIn : "4h"}
    );

    // Caso correcto, donde el usuario pudo iniciar sesion.

    return {
        exito : true,
        codHTTP: 200,
        explicacion : "El inicio de sesion se realizo correctamente.",
        datos: {token,datosUsuario}
    };
};

export const cambiarClave = async (idIngresado: string, claveNueva : string) : Promise<respuestaServices> => {
    const queryBuscarUser = `
        SELECT *
        FROM usuario us
        INNER JOIN rol r USING (id_rol)
        WHERE (us.rut = $1 OR us.correo = $1) AND us.eliminado = false
    `;
    const resConsultaBuscarUser = await poolDb.query(queryBuscarUser,[idIngresado]);
    
    // El usuario no se encontro.
    if (resConsultaBuscarUser.rows.length === 0){
        return {
            exito: false,
            codHTTP: 400, 
            explicacion : "No se encontro el usuario con rut/correo ingresado.",
            datos : null
        };
    }

    const datosUsuario = resConsultaBuscarUser.rows[0];

    if (datosUsuario.nuevo_user === false){
        return {
            exito: false, 
            codHTTP: 400,
            explicacion : "El usuario no es nuevo, ya cambio su clave por defecto 1 vez.",
            datos: null
        };
    }

    const hashNuevaClave = await bcrypt.hash(claveNueva,10);

    const queryCambiarClave = `
        UPDATE usuario
        SET hash_contrasenia = $2, nuevo_user = false
        WHERE rut = $1 OR correo = $1
    `;

    await poolDb.query(queryCambiarClave,[idIngresado,hashNuevaClave]);

    return {
        exito : true,
        codHTTP: 200,
        explicacion : "La clave se cambio correctamente.",
        datos : null
    };
};