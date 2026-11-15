import type { Socket } from 'socket.io-client';
import type {
  PayloadBotonPanico,
  PayloadUbicacionPatrullaje,
  PayloadUnirseProyecto,
  RespuestaSocket
} from '../interfaces/ubicacionSocket';

interface CallbacksSalaProyecto {
  onConectado?: () => void;
  onDesconectado?: () => void;
  onUnido: (respuesta: RespuestaSocket) => void;
  onAlertaPanicoEnviada?: (respuesta: RespuestaSocket<null>) => void;
  onErrorSocket: (respuesta: RespuestaSocket) => void;
  onErrorConexion?: (error: Error) => void;
}

export const patrullajeSocketService = {
  /*Suscribe los eventos necesarios para unirse a la sala de un proyecto y confirmar
  alertas enviadas, devolviendo una función de limpieza para removerlos.*/
  registrarListenersSala: (
    socket: Socket,
    {
      onConectado,
      onDesconectado,
      onUnido,
      onAlertaPanicoEnviada,
      onErrorSocket,
      onErrorConexion
    }: CallbacksSalaProyecto
  ): (() => void) => {
    const manejarConexion = () => {
      onConectado?.();
    };

    const manejarDesconexion = () => {
      onDesconectado?.();
    };

    const manejarUnido = (respuesta: RespuestaSocket) => {
      onUnido(respuesta);
    };

    const manejarAlertaPanicoEnviada = (respuesta: RespuestaSocket<null>) => {
      onAlertaPanicoEnviada?.(respuesta);
    };

    const manejarErrorSocket = (respuesta: RespuestaSocket) => {
      onErrorSocket(respuesta);
    };

    const manejarErrorConexion = (error: Error) => {
      onErrorConexion?.(error);
    };

    socket.on('connect', manejarConexion);
    socket.on('disconnect', manejarDesconexion);
    socket.on('unidoAProyecto', manejarUnido);
    socket.on('alertaPanicoEnviada', manejarAlertaPanicoEnviada);
    socket.on('errorSocket', manejarErrorSocket);
    socket.on('connect_error', manejarErrorConexion);

    return () => {
      socket.off('connect', manejarConexion);
      socket.off('disconnect', manejarDesconexion);
      socket.off('unidoAProyecto', manejarUnido);
      socket.off('alertaPanicoEnviada', manejarAlertaPanicoEnviada);
      socket.off('errorSocket', manejarErrorSocket);
      socket.off('connect_error', manejarErrorConexion);
    };
  },

  /*Solicita al servidor unir este socket a la sala exclusiva del proyecto (`proyecto_<id>`).
  Es requisito previo antes de poder emitir ubicaciones o alertas.*/
  unirseProyecto: (socket: Socket, idProyecto: number): void => {
    const payload: PayloadUnirseProyecto = { id_proyecto: idProyecto };
    socket.emit('unirseProyecto', payload);
  },

  /*Emite las coordenadas actuales del patrullero hacia la sala del proyecto
  para que el servidor las retransmita en tiempo real a supervisores/admins.*/
  enviarUbicacion: (socket: Socket, datosUbicacion: PayloadUbicacionPatrullaje): void => {
    socket.emit('enviarUbicacion', datosUbicacion);
  },

  /*Emite la alerta crítica de botón de pánico por WebSocket hacia la sala del proyecto
  para notificar de inmediato a los supervisores/administradores en el Gestor.*/
  enviarAlertaPanico: (socket: Socket, datosAlerta: PayloadBotonPanico): void => {
    socket.emit('botonDePanico', datosAlerta);
  }
};
