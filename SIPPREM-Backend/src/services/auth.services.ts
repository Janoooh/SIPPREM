import {poolDb} from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const iniciarSesion = async (idIngresado : string, claveIngresada: string) => {
    const queryBuscarUser = `
        SELECT *
        FROM usuario us
        INNER JOIN rol r USING (id_rol)
        WHERE us.rut = $1 OR us.correo = $1
    `;

    const resConsulta = await poolDb.query(queryBuscarUser,[idIngresado]);

    // El usuario no se encontro.
    if (resConsulta.rows.length === 0){
        return null;
    }

    const datosUsuario = resConsulta.rows[0];

    const comparacionClave = await bcrypt.compare(claveIngresada, datosUsuario.hash_contrasenia);

    // La clave ingresada no es la correcta clave del usuario ingresado.
    if (!comparacionClave){
        return null;
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
        token,
        datosUsuario
    };
};