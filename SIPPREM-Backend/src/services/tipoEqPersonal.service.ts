import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Funcion que hace la consulta a la base de datos para obtener los tipos de equipamientos personales del sistema
export const mostrarTiposEqPersonales= async (): Promise <respuestaServices> =>{

    const query = `
                    select *
                    from tipo_equipamiento_personal;
    `;
    
    const resultado = await poolDb.query(query);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay tipos de equipamientos personales para mostrar.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Estos son los tipos de equipamientos personales registrados.",
        datos: resultado.rows
    };
};

