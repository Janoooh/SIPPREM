import { createContext, useContext } from 'react';
import type { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import type { CoordenadasDispositivo } from '../interfaces/ubicacionSocket';

export const EVENTO_SESION_PATRULLERO = 'sipprem-sesion-actualizada';
export const EVENTO_ESTADO_PATRULLAJE = 'sipprem-estado-patrullaje-actualizado';

export interface ResultadoEnvioPanico {
  ok: boolean;
  tituloError?: string;
  message: string;
}

export interface SeguimientoContextValue {
  patrullajeEnCurso: PatrullajeUsuario | null;
  cargandoEstado: boolean;
  ubicacion: CoordenadasDispositivo | null;
  errorUbicacion: string | null;
  salaUnida: boolean;
  errorSocket: string | null;
  enviandoPanico: boolean;
  sincronizarPatrullajeEnCurso: () => Promise<PatrullajeUsuario | null>;
  detenerSeguimientoPorFinalizacion: () => void;
  enviarAlertaPanico: (idProyectoPreferido?: number) => Promise<ResultadoEnvioPanico>;
}

export const SeguimientoContext = createContext<SeguimientoContextValue | null>(null);

/**
 * Dispara la resincronización global de sesión/patrullaje en curso
 * (al iniciar sesión, iniciar patrullaje o finalizar patrullaje).
 */
export const notificarCambioEstadoPatrullaje = (): void => {
  window.dispatchEvent(new Event(EVENTO_ESTADO_PATRULLAJE));
};

/**
 * Hook para acceder al GPS, patrullaje en curso y canal Socket.IO global del patrullero.
 */
export const useSeguimientoGlobal = (): SeguimientoContextValue => {
  const context = useContext(SeguimientoContext);
  if (!context) {
    throw new Error('useSeguimientoGlobal debe usarse dentro de un SeguimientoProvider.');
  }
  return context;
};
