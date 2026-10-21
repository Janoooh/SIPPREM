import {poolDb} from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Consulta a la base de datos por los equipamientos vehiculares dado un proyecto
export const mostrarEquipamientosVehiculares= async (id_proyecto: number): Promise <respuestaServices> =>{
    //Verifica que el proyecto dado exista en la base de datos
    const queryProyecto = `select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }

    //Query para mostrar los equipamientos vehiculares relacionados a un proyecto
    const query = `
                    select id_item, tipo_eq_vehicular 
                    from equipamiento_vehicular
                    inner join tipo_equipamiento_vehicular 
                        on equipamiento_vehicular.id_tipo_eq_vehicular = tipo_equipamiento_vehicular.id_tipo_eq_vehicular
                    where eliminado = false and id_proyecto = $1
                    ;
    `;
    
    const resultado = await poolDb.query(query, [id_proyecto]);

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

// Consulta a la base de datos para mostrar un único equipamiento vehicular dado su ID
export const mostrarUNequipamientoVehicular = async (id_item: string, id_proyecto : number): Promise<respuestaServices> => {
     //Verifica que el proyecto dado exista en la base de datos
    const queryProyecto = `select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }

    //Query para mostrar el registro de un equipamiento vehicular en el proyecto
    const query = `
        select id_item, tipo_eq_vehicular
        from equipamiento_vehicular
        inner join tipo_equipamiento_vehicular 
            on equipamiento_vehicular.id_tipo_eq_vehicular = tipo_equipamiento_vehicular.id_tipo_eq_vehicular
        where id_item = $1 and eliminado = false and id_proyecto = $2;
    `;

    const resultado = await poolDb.query(query, [id_item, id_proyecto]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Equipamiento vehicular no encontrado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Equipamiento vehicular encontrado correctamente.",
        datos: resultado.rows[0]
    };
};


// agregar un equipamiento vehicular a la base de datos
export const agregarEquipamientoVehicular = async (id_item: string, id_proyecto: number, id_tipo : number): Promise <respuestaServices> =>{
    //Se verifica que el proyecto exista
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

    //Se verifica que el tipo de equipamiento exista
    const queryTipoEqVehicular = `select * from tipo_equipamiento_vehicular where id_tipo_eq_vehicular = $1;`
    const vehiculo = await poolDb.query(queryTipoEqVehicular, [id_tipo]);

    if (vehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese tipo de equipamiento vehicular no existe.",
            datos : null
        };
    }


    //valida que no haya algun objeto con el mismo identificador en la base de datos
    const queryEqVe ='select id_item from item where id_item = $1;';
    const EqVehicular = await poolDb.query(queryEqVe, [id_item]);

    if (EqVehicular.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 409,
            explicacion : "Ya existe un objeto con ese identificador.",
            datos : null
        };
    }


    //Query para agregar un equipamiento a la base de datos
    const query = `
                    insert into equipamiento_vehicular (id_item, id_proyecto, id_tipo_eq_vehicular)
                    values ($1, $2, $3)
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id_item, id_proyecto, id_tipo]);
    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "Equipamiento vehicular registrado correctamente.",
        datos : resultado.rows[0]
    };
};

// Actualiza un equipamiento vehicular usando COALESCE
export const actualizarEquipamientoVehicular = async (id_item: string, id_tipo: number | null, id_proyecto: number): Promise<respuestaServices> => {
    //Se valida que exista el proyecto en la base de datos
    const queryProyecto = `select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "El proyecto no existe.",
            datos: null
        };
    }

    //Se valida el tipo de equipamiento vehicular
    if (id_tipo !== null) {
        const queryTipo = `select * from tipo_equipamiento_vehicular where id_tipo_eq_vehicular = $1;`;
        const tipoExiste = await poolDb.query(queryTipo, [id_tipo]);

        if (tipoExiste.rows.length === 0) {
            return {
                exito: false,
                codHTTP: 404,
                explicacion: "El tipo de equipamiento vehicular especificado no existe.",
                datos: null
            };
        }
    }

    //Usamos COALESCE para mantener el valor actual si la variable llega como null
    const query = `
        update equipamiento_vehicular
        set 
            id_tipo_eq_vehicular = coalesce($1, id_tipo_eq_vehicular)
        where id_item = $3 and eliminado = false and id_proyecto = $2
        returning id_item, id_proyecto, id_tipo_eq_vehicular;
    `;

    const resultado = await poolDb.query(query, [id_tipo, id_proyecto, id_item]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Equipamiento vehicular no encontrado o se encuentra eliminado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Equipamiento vehicular actualizado correctamente.",
        datos: resultado.rows[0]
    };
};



// Elimina de forma logica un equipamiento vehicular de la base de datos
export const eliminarEquipamientoVehicular = async (id: string, id_proyecto: number): Promise <respuestaServices>  => {
    const query = `
                    update equipamiento_vehicular
                    set eliminado = true
                    where id_item = $1 and eliminado = false and id_proyecto = $2
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id, id_proyecto]);
    
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

