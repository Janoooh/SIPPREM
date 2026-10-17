import {poolDb} from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

export const verArticulosVehiculares= async (): Promise <respuestaServices> =>{
    const query = `
                    select id_item, tipo_eq_vehicular 
                    from equipamiento_vehicular
                    inner join tipo_equipamiento_vehicular 
                        on equipamiento_vehicular.id_tipo_eq_vehicular = tipo_equipamiento_vehicular.id_tipo_eq_vehicular
                    where eliminado = false
                    ;
    `;
    
    const resultado = await poolDb.query(query);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay articulos vehiculares para mostrar.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Estos son los articulos registrados.",
        datos: resultado.rows
    };
};

export const verArticuloVehicular = async (id: string): Promise <respuestaServices> =>{
    const query = `
                    select id_item, tipo_eq_vehicular
                    from equipamiento_vehicular
                    inner join tipo_equipamiento_vehicular 
                        on equipamiento_vehicular.id_tipo_eq_vehicular = tipo_equipamiento_vehicular.id_tipo_eq_vehicular
                    where id_item = $1 and eliminado = false;
    `;

    const resultado = await poolDb.query(query, [id]);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay articulos vehiculares con ese identificador.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Articulos vehicular encontrado.",
        datos: resultado.rows[0]
    };
};

export const agregarArticuloVehicular = async (id_item: string, id_proyecto: number, id_tipo : number): Promise <respuestaServices> =>{
    const query = `
                    insert into equipamiento_vehicular (id_item, id_proyecto, id_tipo_eq_vehicular)
                    values ($1, $2, $3)
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id_item, id_proyecto, id_tipo]);
    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "Articulo vehicular registrado correctamente.",
        datos : resultado.rows[0]
    };
};


export const editarArticuloVehicular = async (id: string, id_tipo: number, id_vehiculo: string | null = null): Promise<respuestaServices> => {
    const query = `
                    update equipamiento_vehicular
                    set id_tipo_eq_vehicular = $1, id_vehiculo = $2
                    where id_item = $3 and eliminado = false
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id_tipo, id_vehiculo, id]);

    if (!resultado.rows[0]) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Articulo vehicular no encontrado para actualizar.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Articulo vehicular actualizado correctamente.",
        datos: resultado.rows[0]
    };
};

export const borrarArticuloVehicular = async (id: string): Promise <respuestaServices>  => {
    const query = `
                    update equipamiento_vehicular
                    set eliminado = true
                    where id_item = $1
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id]);
    
    if(!resultado.rows[0]){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Articulo vehicular no encontrado.",
            datos : null
        };
    }
    
    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Articulo vehicular eliminado correctamente.",
        datos : resultado.rows[0]
    };
};