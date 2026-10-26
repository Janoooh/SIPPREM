import { apiClient } from './apiClient';
import { nuevoProyectoData } from '../interfaces/proyectoPatrullaje';

/* ==========================================================================
   INICIO SECCIÓN CREADA: Servicio para gestionar las peticiones de proyectos
   ========================================================================== */
export const proyectosService = {
    /* Funcion obtenerProyectos: Encargada de traer los proyectos desde el backend
    utilizando apiClient mediante una peticion GET al endpoint /proyectos. */
    obtenerProyectos: async () => {

        const resObtenerProyectos = await apiClient.get("/proyectos");

        return resObtenerProyectos.data.data;
    },

    /* Funcion obtenerProyectoPorId: Obtiene la informacion detallada de un proyecto
    especifico mediante GET /proyectos/:id_proyecto. */
    obtenerProyectoPorId: async (id_proyecto: string | number) => {

        const resObtenerProyecto = await apiClient.get(`/proyectos/${id_proyecto}`);

        return resObtenerProyecto.data.data;
    },

    /* Funcion crearProyecto: Encargada de registrar un nuevo proyecto en el sistema
    enviando los datos al backend mediante una peticion POST al endpoint /proyectos. */
    crearProyecto: async (nuevoProyecto: nuevoProyectoData) => {

        const resCrearProyecto = await apiClient.post("/proyectos", nuevoProyecto);

        return resCrearProyecto.data;
    },

    /* Funcion modificarProyecto: Actualiza los datos de un proyecto existente
    mediante una peticion PUT al endpoint /proyectos/:id_proyecto. */
    modificarProyecto: async (id_proyecto: string | number, proyectoModificado: nuevoProyectoData & { activo?: boolean }) => {

        const resModificarProyecto = await apiClient.put(`/proyectos/${id_proyecto}`, proyectoModificado);

        return resModificarProyecto.data;
    },

    /* Funcion eliminarProyecto: Elimina logicamente un proyecto de la base de datos
    mediante una peticion DELETE al endpoint /proyectos/:id_proyecto. */
    eliminarProyecto: async (id_proyecto: string | number) => {

        const resEliminarProyecto = await apiClient.delete(`/proyectos/${id_proyecto}`);

        return resEliminarProyecto.data;
    }
};
/* ==========================================================================
   FIN SECCIÓN CREADA
   ========================================================================== */
