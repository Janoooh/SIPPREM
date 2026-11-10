import express from "express";
import rutasAuth from "./routes/auth.routes.js";
import rutasUsuario from "./routes/usuario.routes.js";
import rutasProyecto from "./routes/proyecto.routes.js";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { verificarTokenJWT } from "./middleware/verificarTokenJWT.js";
import { manejadorDeErrores } from "./middleware/manejadorDeErrores.js";
import { detectarRutaNoEncontrada } from "./middleware/rutaNoEncontrada.js";
import { createServer } from "http";
import { inicializarSocket } from "./config/socket.js";

dotenv.config();

const origenesPermitidos = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origen) => origen.trim())
  : [];

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

app.use(helmet());

app.use(cors(opcionesCors));

app.use(express.json(
  {limit: "10mb"}
));


app.get(["/", "/api/health"], (req, res) => {
  res.status(200).json({
    ok: true,
    message: "El backend esta funcionando correctamente!.",
    data: null
  });
});

app.use("/api/v1/auth",rutasAuth);
app.use("/api/v1/usuarios", verificarTokenJWT, rutasUsuario);
app.use("/api/v1/proyectos", verificarTokenJWT,rutasProyecto);

app.use(detectarRutaNoEncontrada);
app.use(manejadorDeErrores);

const serverHttp = createServer(app);
inicializarSocket(serverHttp,origenesPermitidos);


serverHttp.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(`Servidor ejecutándose en http://localhost:${Number(process.env.BACKEND_PORT)}`);
});