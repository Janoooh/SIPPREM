import { Preferences } from '@capacitor/preferences';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '../config/env';

let socketInstancia: Socket | null = null;
let ultimoTokenUsado: string | null = null;

/* Inicia (o reutiliza) la conexión Socket.IO autenticada usando un token JWT ya obtenido.
  Si el token cambió respecto a la conexión previa, cierra la anterior antes de reconectar.*/
export const conectarSocketConToken = (token: string): Socket => {
  if (!token) {
    throw new Error('No se encontró un token de sesión para conectar al WebSocket.');
  }

  if (socketInstancia && ultimoTokenUsado === token) {
    if (!socketInstancia.connected) {
      socketInstancia.connect();
    }
    return socketInstancia;
  }

  if (socketInstancia) {
    socketInstancia.removeAllListeners();
    socketInstancia.disconnect();
    socketInstancia = null;
  }

  ultimoTokenUsado = token;
  socketInstancia = io(BACKEND_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000
  });

  return socketInstancia;
};

/* Obtiene el token desde Preferences y abre/reutiliza la conexión Socket.IO. */
export const conectarSocket = async (): Promise<Socket> => {
  const { value: token } = await Preferences.get({ key: 'token' });
  if (!token) {
    throw new Error('No se encontró un token de sesión para conectar al WebSocket.');
  }
  return conectarSocketConToken(token);
};

/* Devuelve la instancia activa del socket global sin crear una nueva conexión.*/
export const obtenerSocket = (): Socket | null => socketInstancia;

/* Cierra todos los listeners activos y desconecta el socket actual.*/
export const desconectarSocket = (): void => {
  ultimoTokenUsado = null;
  if (!socketInstancia) return;

  socketInstancia.removeAllListeners();
  socketInstancia.disconnect();
  socketInstancia = null;
};
