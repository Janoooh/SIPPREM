import express from "express";
import rutasAuth from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({
    message: "El backend esta funcionando."
  });
});

app.use("/api/v1/auth",rutasAuth)

/* ZONA DE PRUEBAS



*/

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});