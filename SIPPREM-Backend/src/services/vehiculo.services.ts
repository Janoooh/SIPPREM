import {poolDb} from "../config/db.js";

//Lo voy a escribir asi porque lo entiendo mejor que usando la funcion flecha
export async function verVehiculos(){
    //    patente, marca y tipo
    //ej: 123-ACV, Honda civic, automovil
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo;
    `;

    const resultado = await poolDb.query(query);
    return resultado.rows;
};

export async function verVehiculoID(id:string){
    //retorna lo mismo de antes
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo 
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo 
                where id_item = $1;
    `;

    const resultado = await poolDb.query(query, [id]);
    return resultado.rows;
};

export async function agregarVehiculo(id_item: string, id_proyecto: number, nombre_vehiculo: string, id_tipo_vehiculo: number){
    const query = `
                    insert into vehiculo 
                    values ($1, $2, $3, $4)
                    returning *;
    `;
    
    const resultado = await poolDb.query(query, [id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo]);
    return resultado.rows;
};

export async function borrarVehiculo(id: string){
    const query = `
                    delete from vehiculo 
                    where id_item = $1
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id]);
    return resultado.rows;
}