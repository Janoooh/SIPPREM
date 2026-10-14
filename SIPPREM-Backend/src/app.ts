import express from "express";
import rutasAuth from "./routes/auth.routes.js";
import dotenv from "dotenv";

const app = express();
app.use(express.json());

dotenv.config();

app.get("/", (req, res) => {
  res.json({
    message: "El backend esta funcionando."
  });
});

app.use("/api/v1/auth",rutasAuth)

/* ZONA DE PRUEBAS



*/

app.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(`Servidor ejecutándose en http://localhost:${Number(process.env.BACKEND_PORT)}`);
});