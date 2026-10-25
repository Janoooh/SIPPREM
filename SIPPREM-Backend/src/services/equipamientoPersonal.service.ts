import { poolDb } from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Funcion que hace la consulta a la base de datos para mostrar los equipamientos personales de un proyecto
export const mostrarEquipamientosPersonales= async (id_proyecto : number): Promise <respuestaServices> =>{
    // Valida que el proyecto exista
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

    //SE hace la consulta a la base de datos para que muestre todos los equipamientos personales en el proyecto
    const query = `
                    select id_item, talla, tipo_eq_personal
                    from equipamiento_personal
                    inner join tipo_equipamiento_personal 
                        on equipamiento_personal.id_tipo_eq_personal = tipo_equipamiento_personal.id_tipo_eq_personal
                    where eliminado = false and id_proyecto = $1;
    `;
    
    const resultado = await poolDb.query(query, [id_proyecto]);

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


// Funcion para consultar un equipamiento personal
export const mostrarUNequipamientoPersonal = async (id_item: string, id_proyecto: number): Promise<respuestaServices> => {
        // Valida que el proyecto exista
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

    //Query para que muestre el registro con el id dado dentro del proyecto indicado
    const query = `
        select id_item,tipo_eq_personal, talla
        from equipamiento_personal
        inner join tipo_equipamiento_personal 
            on equipamiento_personal.id_tipo_eq_personal = tipo_equipamiento_personal.id_tipo_eq_personal
        where id_item = $1 and eliminado = false and id_proyecto = $2;
    `;
    
    const resultado = await poolDb.query(query, [id_item, id_proyecto]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Equipamiento personal no encontrado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Equipamiento personal encontrado exitosamente.",
        datos: resultado.rows[0]
    };
};


// Agrega un equipamiento personal a la base de datos
export const agregarEquipamientoPersonal = async (id_item: string, id_proyecto: number, id_tipo: number, talla : string): Promise <respuestaServices> =>{
    //Verifica que el proyecto exista
    const queryProyecto =`select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado= false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }

    //Verifica que el equipamiento personal exista
    const queryTipoEqPersonal = `select id_tipo_eq_personal from tipo_equipamiento_personal where id_tipo_eq_personal = $1;`
    const vehiculo = await poolDb.query(queryTipoEqPersonal, [id_tipo]);

    if (vehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese tipo de equipamiento vehicular no existe.",
            datos : null
        };
    }
    
    //valida que no haya algun objeto con el mismo identificador en la base de datos
    const queryEqPer ='select id_item from item where id_item = $1;';
    const EqPersonal = await poolDb.query(queryEqPer, [id_item]);

    if (EqPersonal.rows.length !== 0){
        return{
            exito: false, 
            codHTTP: 409,
            explicacion : "Ya existe un objeto con ese identificador.",
            datos : null
        };
    }

    //Luego de todas la verificaciones se agrega el equipamiento
    const query = `
                    insert into equipamiento_personal (id_item, id_proyecto, id_tipo_eq_personal, talla)
                    values ($1, $2, $3, $4)
                    returning *;
    `;
    
    const resultado = await poolDb.query(query, [id_item, id_proyecto, id_tipo, talla]);
    return {
        exito: true, 
        codHTTP: 201,
        explicacion : "Equipamiento personal registrado correctamente.",
        datos : resultado.rows[0]
    };
};

// Funcion para actualizar un equipamiento personal usando COALESCE
export const actualizarEquipamientoPersonal = async (id_item: string, id_tipo: number | null, talla: string | null, id_proyecto:number): Promise<respuestaServices> => {
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

    //Se valida el tipo de equipamiento personal
    if (id_tipo !== null) {
        const queryTipo = `select id_tipo_eq_personal from tipo_equipamiento_personal where id_tipo_eq_personal = $1;`;
        const tipoExiste = await poolDb.query(queryTipo, [id_tipo]);

        if (tipoExiste.rows.length === 0) {
            return {
                exito: false,
                codHTTP: 404,
                explicacion: "El tipo de equipamiento personal especificado no existe.",
                datos: null
            };
        }
    }

    //query para modificar el equipamiento dado
    const query = `
        update equipamiento_personal
        set 
            id_tipo_eq_personal = coalesce($1, id_tipo_eq_personal),
            talla = coalesce($2, talla)
        where id_item = $3 and eliminado = false and id_proyecto = $4
        returning id_item, id_proyecto, id_tipo_eq_personal, talla;
    `;

    const resultado = await poolDb.query(query, [id_tipo, talla, id_item, id_proyecto]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Equipamiento personal no encontrado o se encuentra eliminado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Equipamiento personal actualizado correctamente.",
        datos: resultado.rows[0]
    };
};


// Elimina un equipamiento personal de la base de datos
export const eliminarEquipamientoPersonal = async (id: string, id_proyecto: number): Promise <respuestaServices>  => {
    const query = `
                    update equipamiento_personal
                    set eliminado = true
                    where id_item = $1 and eliminado = false and id_proyecto = $2
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id, id_proyecto]);
    
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

