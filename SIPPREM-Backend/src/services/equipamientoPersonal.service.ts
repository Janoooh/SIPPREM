import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";


export const mostrarEquipamientosPersonales= async (id_proyecto : number): Promise <respuestaServices> =>{

    const queryProyecto = `
                                select * 
                                from proyecto_patrullaje
                                where id_proyecto = $1 and eliminado = false;
    `;

    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }


    const query = `
                    select id_item, talla, tipo_eq_personal
                    from equipamiento_personal
                    inner join tipo_equipamiento_personal 
                        on equipamiento_personal.id_tipo_eq_personal = tipo_equipamiento_personal.id_tipo_eq_personal
                    where eliminado = false;
    `;
    
    const resultado = await poolDb.query(query);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay equipamientos personales para mostrar.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Estos son los equipamientos personales registrados.",
        datos: resultado.rows
    };
};



export const agregarEquipamientoPersonal = async (id_item: string, id_proyecto: number, id_tipo: number, talla : string | null = null): Promise <respuestaServices> =>{
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

    const queryTipoEqPersonal = `select * from tipo_equipamiento_personal where id_tipo_eq_personal = $1;`
    const vehiculo = await poolDb.query(queryTipoEqPersonal, [id_tipo]);

    if (vehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese tipo de equipamiento vehicular no existe.",
            datos : null
        };
    }
    
    
    const query = `
                    insert into equipamiento_personal (id_item, id_proyecto, id_tipo_eq_personal, talla)
                    values ($1, $2, $3, $4)
                    returning *;
    `;
    
    const tallaValor = talla && talla.trim() !== "" ? talla : null;

    const resultado = await poolDb.query(query, [id_item, id_proyecto, id_tipo, tallaValor]);
    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "Equipamiento personal registrado correctamente.",
        datos : resultado.rows[0]
    };
};



export const eliminarEquipamientoPersonal = async (id: string): Promise <respuestaServices>  => {
    const query = `
                    update equipamiento_personal
                    set eliminado = true
                    where id_item = $1 and eliminado = false
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id]);
    
    if(!resultado.rows[0]){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Equipamiento personal no encontrado.",
            datos : null
        };
    }
    
    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Equipamiento personal eliminado correctamente.",
        datos : resultado.rows[0]
    };
};


/*
export const mostrarEquipamientoPersonal = async (id: string): Promise <respuestaServices> =>{
    const query = `
                    select id_item, talla, tipo_eq_personal
                    from equipamiento_personal
                    inner join tipo_equipamiento_personal 
                        on equipamiento_personal.id_tipo_eq_personal = tipo_equipamiento_personal.id_tipo_eq_personal
                    where id_item = $1 and eliminado = false;
    `;

    const resultado = await poolDb.query(query, [id]);

    if(resultado.rows.length === 0){
        return{
            exito: false,
            codHTTP: 404,
            explicacion: "No hay equipamiento personal con ese identificador.",
            datos: null
        };
    }
    
    return {
        exito: true,
        codHTTP: 200,
        explicacion: "equipamiento personal encontrado.",
        datos: resultado.rows[0]
    };
};

*/

/*
export const actualizarEquipamientoPersonal = async (id: string, id_tipo: number, talla: string | null = null): Promise<respuestaServices> => {
    const query = `
                    update equipamiento_personal
                    set id_tipo_eq_personal = $1, talla = $2
                    where id_item = $3 and eliminado = false
                    returning *;
    `;
    const tallaValor = talla && talla.trim() !== "" ? talla : null;

    const resultado = await poolDb.query(query, [id_tipo, tallaValor, id]);

    if (!resultado.rows[0]) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Equipamiento personal no encontrado para actualizar.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Equipamiento personal actualizado correctamente.",
        datos: resultado.rows[0]
    };
};*/