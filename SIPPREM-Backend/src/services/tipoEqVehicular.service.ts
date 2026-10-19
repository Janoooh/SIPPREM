import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

export const mostrarTiposEqVehiculares= async (): Promise <respuestaServices> =>{

    const query = `
                    select tipo_eq_vehicular
                    from tipo_equipamiento_vehicular;
    `;
    
    const resultado = await poolDb.query(query);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay tipos de equipamientos vehiculares para mostrar.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Estos son los tipos de equipamientos vehiculares registrados.",
        datos: resultado.rows
    };
};

