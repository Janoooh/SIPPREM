import { apiClient } from './apiClient';

/* ==========================================================================
   INICIO SECCIÓN CREADA: Servicio para gestionar las peticiones de proyectos
   ========================================================================== */
export const proyectosService = {
    /* Funcion obtenerProyectos: Encargada de traer los proyectos desde el backend
    utilizando apiClient mediante una peticion GET al endpoint /proyectos. */
    obtenerProyectos: async () => {

        const resObtenerProyectos = await apiClient.get("/proyectos");

        return resObtenerProyectos.data.data;
    }
};
/* ==========================================================================
   FIN SECCIÓN CREADA
   ========================================================================== */
