import type { Socket } from "socket.io";
import { poolDb } from "../config/db.js";


export const registrarEventosPatrullaje = (socket: Socket): void => {

    socket.on("unirseProyecto", (datos: any) => unirseProyectoService(socket, datos));
    socket.on("enviarUbicacion", (datos: any) => enviarUbicacionService(socket, datos));
    socket.on("botonDePanico", (datos: any) => botonDePanicoService(socket, datos));
};

/* Funcion unirseProyectoService: Permite que un usuario autenticado (Admin, Supervisor
o Patrullero) se una al canal exclusivo de un proyecto tras validar que el
proyecto exista y que el usuario tenga acceso a el en la base de datos. */
export const unirseProyectoService = async (socket: Socket, datos: any): Promise<void> => {
    try {

        if (!datos || typeof datos !== "object") {
            socket.emit("errorSocket", {
                ok: false,
                message: "Los datos deben enviarse en formato JSON.",
                data: null
            });
            return;
        }

        const id_proyecto = Number(datos.id_proyecto);

        // Validamos que el id_proyecto enviado sea un numero valido.
        if (!id_proyecto || isNaN(id_proyecto)) {
            socket.emit("errorSocket", {
                ok: false,
                message: "El ID del proyecto debe ser un numero valido.",
                data: null
            });
            return;
        }

        // Verificamos en la BD que el proyecto exista y no este eliminado logicamente.
        const queryVerificarProyecto = `
            SELECT id_proyecto
            FROM proyecto_patrullaje
            WHERE id_proyecto = $1 AND eliminado = false
        `;

        const resProyecto = await poolDb.query(queryVerificarProyecto, [id_proyecto]);

        if (resProyecto.rows.length === 0) {
            socket.emit("errorSocket", {
                ok: false,
                message: `El proyecto con ID ${id_proyecto} no existe.`,
                data: null
            });
            return;
        }

        // Obtenemos el rol y RUT del usuario, que llegaron del verificarTokenSocket.
        const rolUsuario = socket.data.usuario?.rol?.toLowerCase();
        const rutUsuario = socket.data.usuario?.rutUsuario;

        // Si no es admin tenemos que verificar su pertenencia al proyecto.
        if (rolUsuario !== "admin") {
            const queryPertenencia = `
                SELECT rut, id_proyecto
                FROM acceso_proyecto
                WHERE rut = $1 AND id_proyecto = $2
            `;
            const resPertenencia = await poolDb.query(queryPertenencia, [rutUsuario, id_proyecto]);

            if (resPertenencia.rows.length === 0) {
                socket.emit("errorSocket", {
                    ok: false,
                    message: "No tienes permiso para acceder al canal de este proyecto.",
                    data: null
                });
                return;
            }
        }

        // Unimos el socket a la sala privada del proyecto seleccionado
        const nombreSala = `proyecto_${id_proyecto}`;
        await socket.join(nombreSala);


        socket.emit("unidoAProyecto", {
            ok: true,
            message: `Te uniste correctamente al canal del proyecto ${id_proyecto}.`,
            data: { id_proyecto, sala: nombreSala }
        });
    } catch {
        socket.emit("errorSocket", {
            ok: false,
            message: "Error al procesar la solicitud para unirse al proyecto.",
            data: null
        });
    }
};

/* Funcion enviarUbicacionService: Recibe las coordenadas GPS en vivo de un
patrullero y las retransmite a todos los supervisores/administradores conectados
a la sala de ese proyecto junto con los datos de su patrullaje activo. */
export const enviarUbicacionService = (socket: Socket, datos: any): void => {
    try {
        if (!datos || typeof datos !== "object") {
            socket.emit("errorSocket", {
                ok: false,
                message: "Los datos deben enviarse en formato JSON.",
                data: null
            });
            return;
        }

        const { id_proyecto, id_patrullaje, id_vehiculo, hora_inicio, hora_termino, latitud, longitud } = datos;

        // Solo el rol patrullero puede emitir ubicaciones de patrullaje en terreno.
        const rolUsuario = socket.data.usuario?.rol?.toLowerCase();
        if (rolUsuario !== "patrullero") {
            socket.emit("errorSocket", {
                ok: false,
                message: "Solo los usuarios con rol patrullero pueden emitir su ubicacion.",
                data: null
            });
            return;
        }

        /* Verificamos que el patrullero ya se haya unido previamente a la sala del proyecto
        (Esto garantiza que ya paso por la validacion de pertenencia al proyecto).*/
        const nombreSala = `proyecto_${id_proyecto}`;
        if (!id_proyecto || !socket.rooms.has(nombreSala)) {
            socket.emit("errorSocket", {
                ok: false,
                message: "Debes unirte primero al canal del proyecto antes de enviar tu ubicacion.",
                data: null
            });
            return;
        }

        // Validamos que vengan las coordenadas geograficas obligatorias.
        if (latitud == null || longitud == null || isNaN(Number(latitud)) || isNaN(Number(longitud))) {
            socket.emit("errorSocket", {
                ok: false,
                message: "Debes enviar una latitud y longitud numericas validas.",
                data: null
            });
            return;
        }

        // Retransmitimos la ubicacion y datos del turno a todos los demas en la sala del proyecto
        socket.to(nombreSala).emit("ubicacionPatrullero", {
            ok: true,
            message: "Ubicacion de patrullero actualizada.",
            data: {
                rut: socket.data.usuario?.rutUsuario,
                nombre: socket.data.usuario?.nombre,
                id_proyecto: Number(id_proyecto),
                id_patrullaje: id_patrullaje ?? null,
                id_vehiculo: id_vehiculo ?? null,
                hora_inicio: hora_inicio ?? null,
                hora_termino: hora_termino ?? null,
                latitud: Number(latitud),
                longitud: Number(longitud),
                fecha_actualizacion: new Date()
            }
        });
    } catch {
        socket.emit("errorSocket", {
            ok: false,
            message: "Formato de datos invalido al enviar la ubicacion.",
            data: null
        });
    }
};

/* Funcion botonDePanicoService: Emite una alerta critica e inmediata a la sala
del proyecto indicando que patrullero solicita socorro y su ubicacion actual. */
export const botonDePanicoService = (socket: Socket, datos: any): void => {
    try {
        if (!datos || typeof datos !== "object") {
            socket.emit("errorSocket", {
                ok: false,
                message: "Los datos deben enviarse en formato JSON.",
                data: null
            });
            return;
        }

        const { id_proyecto, latitud, longitud } = datos;

        // Validamos que quien activa el boton de panico sea un patrullero.
        const rolUsuario = socket.data.usuario?.rol?.toLowerCase();
        if (rolUsuario !== "patrullero") {
            socket.emit("errorSocket", {
                ok: false,
                message: "Solo un patrullero puede activar el boton de panico.",
                data: null
            });
            return;
        }

        // Verificamos que el patrullero este unido a la sala del proyecto correspondiente.
        const nombreSala = `proyecto_${id_proyecto}`;
        if (!id_proyecto || !socket.rooms.has(nombreSala)) {
            socket.emit("errorSocket", {
                ok: false,
                message: "Debes estar unido al canal del proyecto para emitir una alerta de panico.",
                data: null
            });
            return;
        }

        // Validamos que se envie la ubicacion donde se solicita el auxilio
        if (latitud == null || longitud == null || isNaN(Number(latitud)) || isNaN(Number(longitud))) {
            socket.emit("errorSocket", {
                ok: false,
                message: "Se requiere una latitud y longitud validas para emitir la alerta de panico.",
                data: null
            });
            return;
        }

        // Emitimos la alerta de panico a todos los supervisores/admins conectados al proyecto
        socket.to(nombreSala).emit("alertaPanico", {
            ok: true,
            message: "BOTON DE PANICO PRESIONADO: Un patrullero solicita apoyo de emergencia inmediato.",
            data: {
                rut: socket.data.usuario?.rutUsuario,
                nombre: socket.data.usuario?.nombre,
                id_proyecto: Number(id_proyecto),
                latitud: Number(latitud),
                longitud: Number(longitud),
                fecha_hora: new Date()
            }
        });

        // Confirmamos al patrullero que su alerta fue enviada a la central.
        socket.emit("alertaPanicoEnviada", {
            ok: true,
            message: "Tu alerta de panico fue enviada exitosamente al supervisor del proyecto.",
            data: null
        });
    } catch {
        socket.emit("errorSocket", {
            ok: false,
            message: "Formato de datos invalido al activar el boton de panico.",
            data: null
        });
    }
};
