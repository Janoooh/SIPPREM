import express from "express";
import rutasAuth from "./routes/auth.routes.js";
import rutasUsuario from "./routes/usuario.routes.js";
import rutasProyecto from "./routes/proyecto.routes.js";
import dotenv from "dotenv";
import cors from "cors";
import { verificarTokenJWT } from "./middleware/verificarTokenJWT.js";

dotenv.config();

const origenesPermitidos = [
  "http://localhost:5173", // Puerto para servidor de vite
  "http://localhost:8100" // Puerto para servidor de Ionic serve
];

const opcionesCors: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Acceso bloqueado por política de CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

const app = express();
app.use(express.json(
  {limit: "10mb"}
));
app.use(cors(opcionesCors));



app.get("/", (req, res) => {
  res.json({
    message: "El backend esta funcionando."
  });
});

app.use("/api/v1/auth",rutasAuth);
app.use("/api/v1/usuarios", verificarTokenJWT, rutasUsuario);
app.use("/api/v1/proyectos", verificarTokenJWT,rutasProyecto);

app.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(`Servidor ejecutándose en http://localhost:${Number(process.env.BACKEND_PORT)}`);
});