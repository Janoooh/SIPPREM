import {poolDb} from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

//Lo voy a escribir asi porque lo entiendo mejor que usando la funcion flecha
export const mostrarVehiculos= async (id: number): Promise<respuestaServices> => {
    const queryProyecto = `
                                select * 
                                from proyecto_patrullaje
                                where id_proyecto = $1 and eliminado = false;
    `;

    const proyecto = await poolDb.query(queryProyecto, [id]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }

    //    patente, marca y tipo
    //ej: 123-ACV, Honda civic, automovil
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo
                where eliminado = false and id_proyecto = $1;
    `;

    const resultado = await poolDb.query(query, [id]);

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


export const agregarVehiculo = async(id_item: string, id_proyecto: number, nombre_vehiculo: string, id_tipo_vehiculo: number) :Promise<respuestaServices> => {
    const queryProyecto =`select * from proyecto_patrullaje where id_proyecto = $1 and eliminado= false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }

    const queryTipoVehiculo = `select * from tipo_vehiculo where id_tipo_vehiculo = $1;`
    const vehiculo = await poolDb.query(queryTipoVehiculo, [id_tipo_vehiculo]);

    if (vehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese tipo de vehiculo no existe.",
            datos : null
        };
    }

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



export const eliminarVehiculo =  async (id: string):Promise<respuestaServices> => {
    const query = `
                    update vehiculo 
                    set eliminado = true
                    where id_item = $1 and eliminado = false
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