import { rateLimit } from "express-rate-limit";

/* Funcion limitarRequestLogin: Middleware que nos permite limitar
la cantidad de peticiones que se envian en una ventana especifica de tiempo,
para este caso se limita a 10 peticiones por 10 minutos.*/
export const limitarRequestLogin = rateLimit({
    windowMs: (10 * 60) * 1000,
    limit: 10,
    message: {
        ok: false,
        message: "Superaste el numero de intentos de sesion, pruebe mas tarde.",
        data: null
    }
});