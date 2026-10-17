import {poolDb} from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

//Lo voy a escribir asi porque lo entiendo mejor que usando la funcion flecha
export const verVehiculos= async (): Promise<respuestaServices> => {
    //    patente, marca y tipo
    //ej: 123-ACV, Honda civic, automovil
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo
                where eliminado = false;
    `;

    const resultado = await poolDb.query(query);

    //caso en que la consulta retorna nada, es decir []
    if (resultado.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "No hay vehiculos para mostrar.",
            datos : null
        };

    }

    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Estos son los vehiculos registrados.",
        datos : resultado.rows
    };
};

export const verVehiculoID = async(id:string): Promise<respuestaServices> => {
    //retorna lo mismo de antes
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo 
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo 
                where id_item = $1 and eliminado = false;
    `;

    const resultado = await poolDb.query(query, [id]);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No existe vehiculo con esa patente.",
            datos: null
        };
    }

    return{
        exito: true,
        codHTTP: 200,
        explicacion: "Vehiculo encontrado.",
        datos: resultado.rows[0]
    };
};

export const agregarVehiculo = async(id_item: string, id_proyecto: number, nombre_vehiculo: string, id_tipo_vehiculo: number) :Promise<respuestaServices> => {
    const query = `
                    insert into vehiculo (id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo)
                    values ($1, $2, $3, $4)
                    returning *;
    `;
    
    const resultado = await poolDb.query(query, [id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo]);
    
    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "Vehiculo registrado correctamente.",
        datos : resultado.rows[0]
    };
};

export const borrarVehiculo =  async (id: string):Promise<respuestaServices> => {
    const query = `
                    update vehiculo 
                    set eliminado = true
                    where id_item = $1
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id]);

    if(!resultado.rows[0]){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Vehiculo no encontrado.",
            datos : null
        };
    }
    
    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Vehiculo eliminado correctamente.",
        datos : resultado.rows[0]
    };
};