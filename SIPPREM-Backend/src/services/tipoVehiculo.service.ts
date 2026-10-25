import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Funcion que hace la consulta sobre los tipos de vehiculos que hay en la base de datos
export const mostrarTipoVehiculo= async (): Promise <respuestaServices> =>{

    const query = `
                    select *
                    from tipo_vehiculo;
    `;
    
    const resultado = await poolDb.query(query);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay tipos de vehiculo para mostrar.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Estos son los tipos de vehiculo registrados.",
        datos: resultado.rows
    };
};

