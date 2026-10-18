import express from "express";
import rutasAuth from "./routes/auth.routes.js";
import dotenv from "dotenv";
import cors from "cors";




const app = express();
app.use(express.json());
app.use(cors());

dotenv.config();

app.get("/", (req, res) => {
  res.json({
    message: "El backend esta funcionando."
  });
});




/*
 
  NO PONGAN NINGUNA RUTA ACA WN DESPUES LO UNIFICAMOS ENTRE TODOS 
    ES EL UNICO ARCHIVO QUE COMPARTIMOS ENTRE TODOS ASI QUE PUEDE
      QUEDAR LA CAGA PORFA NO PONGAN WEAS AQUI
        USELO PARA PROBAR PERO DESPUES BORREN LAS COSAS
 
 */
/* ZONA DE PRUEBAS
son imports: 
import rutasActividad from "./routes/actividad.routes.js";
import rutastrabajadores from "./routes/trabajadores.routes.js";
son rutas:
app.use("/api/v1/actividades", rutasActividad); No borrar!
app.use("/api/v1/trabajadores", rutastrabajadores);


*/

app.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(`Servidor ejecutándose en http://localhost:${Number(process.env.BACKEND_PORT)}`);
});