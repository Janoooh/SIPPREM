import {poolDb} from "../config/db.js";

export const conseguirDatos = async () => {
    const query = `
        SELECT *
        FROM rol;
    `;
    
    const resultado = await poolDb.query(query)
    
    return resultado.rows;
};