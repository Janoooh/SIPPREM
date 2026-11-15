import type { Socket } from 'socket.io-client';
import type {
  AlertaPanicoData,
  PayloadUnirseProyecto,
  RespuestaSocket,
  UbicacionPatrulleroData,
  UnidoAProyectoData
} from '../interfaces/ubicacionPatrullero';

interface CallbacksSocketGlobal {
  onConectado?: () => void;
  onDesconectado?: () => void;
  onUnido?: (respuesta: RespuestaSocket<UnidoAProyectoData>) => void;
  onUbicacionPatrullero?: (respuesta: RespuestaSocket<UbicacionPatrulleroData>) => void;
  onAlertaPanico?: (respuesta: RespuestaSocket<AlertaPanicoData>) => void;
  onErrorSocket?: (respuesta: RespuestaSocket) => void;
  onErrorConexion?: (error: Error) => void;
}

export const mapaGpsSocketService = {
  /*Suscribe los listeners globales de conexión, ingreso a salas, ubicaciones en vivo
   y alertas de botón de pánico, devolviendo una función de limpieza para removerlos.*/
  registrarListenersGlobales: (
    socket: Socket,
    {
      onConectado,
      onDesconectado,
      onUnido,
      onUbicacionPatrullero,
      onAlertaPanico,
      onErrorSocket,
      onErrorConexion
    }: CallbacksSocketGlobal
  ): (() => void) => {
    const manejarConexion = () => {
      onConectado?.();
    };

    const manejarDesconexion = () => {
      onDesconectado?.();
    };

    const manejarUnido = (respuesta: RespuestaSocket<UnidoAProyectoData>) => {
      onUnido?.(respuesta);
    };

    const manejarUbicacion = (respuesta: RespuestaSocket<UbicacionPatrulleroData>) => {
      onUbicacionPatrullero?.(respuesta);
    };

    const manejarAlertaPanico = (respuesta: RespuestaSocket<AlertaPanicoData>) => {
      onAlertaPanico?.(respuesta);
    };

    const manejarErrorSocket = (respuesta: RespuestaSocket) => {
      onErrorSocket?.(respuesta);
    };

    const manejarErrorConexion = (error: Error) => {
      onErrorConexion?.(error);
    };

    socket.on('connect', manejarConexion);
    socket.on('disconnect', manejarDesconexion);
    socket.on('unidoAProyecto', manejarUnido);
    socket.on('ubicacionPatrullero', manejarUbicacion);
    socket.on('alertaPanico', manejarAlertaPanico);
    socket.on('errorSocket', manejarErrorSocket);
    socket.on('connect_error', manejarErrorConexion);

    return () => {
      socket.off('connect', manejarConexion);
      socket.off('disconnect', manejarDesconexion);
      socket.off('unidoAProyecto', manejarUnido);
      socket.off('ubicacionPatrullero', manejarUbicacion);
      socket.off('alertaPanico', manejarAlertaPanico);
      socket.off('errorSocket', manejarErrorSocket);
      socket.off('connect_error', manejarErrorConexion);
    };
  },

  /*Une este cliente supervisor/admin a la sala `proyecto_<id_proyecto>` para
   recibir ubicaciones y alertas de pánico emitidas dentro de ese proyecto.*/
  unirseProyecto: (socket: Socket, idProyecto: number): void => {
    const payload: PayloadUnirseProyecto = { id_proyecto: idProyecto };
    socket.emit('unirseProyecto', payload);
  }
};
