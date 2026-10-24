import {poolDb} from "../config/db.js";
import type { respuestaServices } from "../interfaces/respuestaServices.js";

// Funcion que muestra los vehiculos relacionado a un proyecto
export const mostrarVehiculos= async (id_proyecto: number): Promise<respuestaServices> => {
    // Se hace la consulta para ver si existe el proyecto dado
    const queryProyecto = `select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    // verifica si la consulta anterior retorno algun dato, en este si tiene almenos una fila
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }


    // Consulta para ver los vehiculos relacionados a un proyecto el formato que devuelve es el siguiente:
    //    patente, marca y tipo
    //ej: 123-ACV, Honda civic, automovil
    const query= `
                select id_item, nombre_vehiculo, tipo_vehiculo
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo
                where eliminado = false and id_proyecto = $1;
    `;

    const resultado = await poolDb.query(query, [id_proyecto]);

    //caso en que la consulta retorna nada, es decir []
    if (resultado.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "No hay vehiculos para mostrar.",
            datos : null
        };

    }

    // En otro caso retorna los resultados.  Si hay algun error con la BD lo captura el catch del controlador
    return {
        exito: true, 
        codHTTP: 200,
        explicacion : "Estos son los vehiculos registrados.",
        datos : resultado.rows
    };
};

//funcion para ver un vehiculo dado un proyecto
export const mostrarUNvehiculo = async (id_item: string, id_proyecto: number): Promise<respuestaServices> => {
    // Se hace la consulta para ver si existe el proyecto dado
    const queryProyecto = `select id_proyecto from proyecto_patrullaje where id_proyecto = $1 and eliminado = false;`;
    const proyecto = await poolDb.query(queryProyecto, [id_proyecto]);
    
    // verifica si la consulta anterior retorno algun dato, en este si tiene almenos una fila
    if (proyecto.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese proyecto no existe.",
            datos : null
        };
    }
    
    //Consulta para mostrar un solo vehiculo
    // formato {"id_item": "ABC-123" , "nombre_vehiculo": "ejemplo V16", "tipo_vehiculo": "Automovil"}
    const query = `
        select id_item, nombre_vehiculo, tipo_vehiculo
                from vehiculo 
                inner join tipo_vehiculo 
                    on vehiculo.id_tipo_vehiculo= tipo_vehiculo.id_tipo_vehiculo
                where eliminado = false and id_proyecto = $1 and id_item = $2;
    `;

    const resultado = await poolDb.query(query, [id_proyecto, id_item]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "vehiculo no encontrado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "vehiculo encontrado correctamente.",
        datos: resultado.rows[0]
    };
};


// Funcion para agregar un vehiculo dado los datos necesarios
export const agregarVehiculo = async(id_item: string, id_proyecto: number, nombre_vehiculo: string, id_tipo_vehiculo: number) :Promise<respuestaServices> => {
    //query para ver si el proyecto existe
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

    //query para ver si el tipo de vehiculo ingresado existe
    const queryTipoVehiculo = `select id_tipo_vehiculo from tipo_vehiculo where id_tipo_vehiculo = $1;`
    const tipoVehiculo = await poolDb.query(queryTipoVehiculo, [id_tipo_vehiculo]);

    if (tipoVehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 404,
            explicacion : "Ese tipo de vehiculo no existe.",
            datos : null
        };
    }
    
    //valida que no haya algun objeto con el mismo identificador en la base de datos
    const queryVehiculo ='select id_item from item where id_item = $1;';
    const vehiculo = await poolDb.query(queryVehiculo, [id_item]);

    if (vehiculo.rows.length === 0){
        return{
            exito: false, 
            codHTTP: 409,
            explicacion : "Ya existe un vehiculo con ese identificador.",
            datos : null
        };
    }


    // Se agrega el vehiculo con los datos ya validados
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

// Funcion para modificar un vehiculo
export const actualizarVehiculo = async (id_vehiculo: string, nombre_vehiculo: string | null, id_tipo_vehiculo: number | null, id_proyecto: number): Promise<respuestaServices> => {
    //verifica el proyecto
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
    
    // en caso que se quiera modificar el tipo de vehiculo entra en el if
    if (id_tipo_vehiculo !== null){
        //query para ver si el tipo de vehiculo ingresado existe
        const queryTipoVehiculo = `select id_tipo_vehiculo from tipo_vehiculo where id_tipo_vehiculo = $1;`
        const tipoVehiculo = await poolDb.query(queryTipoVehiculo, [id_tipo_vehiculo]);

        if (tipoVehiculo.rows.length === 0){
            return{
                exito: false, 
                codHTTP: 404,
                explicacion : "Ese tipo de vehiculo no existe.",
                datos : null
            };
        }
    }

    //Se modifica el nombre y/o el tipo del vehiculo
    const query = `
        update vehiculo
        set 
            nombre_vehiculo = coalesce($1, nombre_vehiculo),
            id_tipo_vehiculo = coalesce($2, id_tipo_vehiculo)
        where id_item = $3 and eliminado = false and id_proyecto = $4
        returning id_item, nombre_vehiculo, id_tipo_vehiculo, id_proyecto;
    `;

    const resultado = await poolDb.query(query, [nombre_vehiculo, id_tipo_vehiculo, id_vehiculo, id_proyecto]);

    if (resultado.rows.length === 0) {
        return {
            exito: false,
            codHTTP: 404,
            explicacion: "Vehiculo no encontrado o se encuentra eliminado.",
            datos: null
        };
    }

    return {
        exito: true,
        codHTTP: 200,
        explicacion: "Vehiculo actualizado correctamente.",
        datos: resultado.rows[0]
    };
};


// Para eliminar un vehiculo
export const eliminarVehiculo =  async (id: string, id_proyecto : number):Promise<respuestaServices> => {
    // Como la eliminacion es logica no se utiliza un delete solo se actualiza el campo "eliminado"
    const query = `
                    update vehiculo 
                    set eliminado = true
                    where id_item = $1 and eliminado = false and id_proyecto = $2
                    returning *;
    `;

    const resultado = await poolDb.query(query, [id, id_proyecto]);

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
