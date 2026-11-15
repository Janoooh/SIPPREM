import { createContext, useContext } from 'react';
import type { UbicacionPatrulleroData } from '../interfaces/ubicacionPatrullero';

export type UbicacionesPorRutMap = Record<string, UbicacionPatrulleroData>;
export type UbicacionesPorProyectoMap = Record<number, UbicacionesPorRutMap>;

export interface SocketGlobalContextValue {
  conectado: boolean;
  salasUnidas: number[];
  errorSocket: string | null;
  ubicacionesPorProyecto: UbicacionesPorProyectoMap;
  asegurarSalaProyecto: (idProyecto: number) => void;
  limpiarUbicacionesFinalizadas: (idProyecto: number, idsFinalizados: number[]) => void;
}

export const SocketGlobalContext = createContext<SocketGlobalContextValue | null>(null);

/**
 * Hook para consumir la conexión Socket.IO global del gestor desde cualquier página.
 */
export const useSocketGlobal = (): SocketGlobalContextValue => {
  const context = useContext(SocketGlobalContext);
  if (!context) {
    throw new Error('useSocketGlobal debe utilizarse dentro de un SocketProvider.');
  }
  return context;
};
