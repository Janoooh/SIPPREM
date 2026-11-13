import { Preferences } from '@capacitor/preferences';
import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '../config/env';

let socketInstancia: Socket | null = null;
let ultimoTokenUsado: string | null = null;

/*Crea (o reutiliza) la conexión WebSocket autenticada usando un token JWT ya obtenido.
Si cambia el token respecto al socket actual, cierra el anterior antes de reconectar.*/
export const conectarSocketConToken = (token: string): Socket => {
  if (!token) {
    throw new Error('No se encontró token de sesión para conectar al WebSocket.');
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

/*Crea (o reutiliza) la conexión WebSocket autenticada con el token JWT
almacenado en Capacitor Preferences, según lo requerido por el backend.*/
export const conectarSocket = async (): Promise<Socket> => {
  const { value: token } = await Preferences.get({ key: 'token' });

  if (!token) {
    throw new Error('No se encontró token de sesión para conectar al WebSocket.');
  }

  return conectarSocketConToken(token);
};

/*Retorna la instancia actual del socket si existe.*/
export const obtenerSocket = (): Socket | null => {
  return socketInstancia;
};

/*Cierra los listeners activos y desconecta el cliente WebSocket de forma limpia.*/
export const desconectarSocket = (): void => {
  ultimoTokenUsado = null;
  if (!socketInstancia) return;

  socketInstancia.removeAllListeners();
  socketInstancia.disconnect();
  socketInstancia = null;
};
