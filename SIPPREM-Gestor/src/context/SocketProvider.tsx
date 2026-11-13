import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useIonRouter } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';
import { obtenerUsuarioActual } from '../hooks/obtenerUsuario';
import type { AlertaPanicoRecibida } from '../interfaces/ubicacionPatrullero';
import type { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import { proyectosService } from '../services/proyectosService';
import {
  conectarSocketConToken,
  desconectarSocket,
  obtenerSocket
} from '../services/socketClient';
import { mapaGpsSocketService } from '../services/mapaGpsSocketService';
import {
  SocketGlobalContext,
  type UbicacionesPorProyectoMap
} from './socketContext';
import ModalAlertaPanico from '../components/ModalAlertaPanico';

const RUTAS_SIN_SOCKET = new Set(['/login', '/cambiar-clave-inicial']);
const ROLES_GESTOR = new Set(['admin', 'supervisor']);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const router = useIonRouter();

  const [conectado, setConectado] = useState<boolean>(false);
  const [salasUnidas, setSalasUnidas] = useState<number[]>([]);
  const [errorSocket, setErrorSocket] = useState<string | null>(null);
  const [ubicacionesPorProyecto, setUbicacionesPorProyecto] =
    useState<UbicacionesPorProyectoMap>({});
  const [alertasPanico, setAlertasPanico] = useState<AlertaPanicoRecibida[]>([]);
  const [rolActivo, setRolActivo] = useState<string>('');

  const sessionKeyActualRef = useRef<string | null>(null);
  const removerListenersRef = useRef<(() => void) | null>(null);
  const salasSolicitadasRef = useRef<Set<number>>(new Set());
  const salasPendientesRef = useRef<Set<number>>(new Set());
  const nombresProyectoRef = useRef<Record<number, string>>({});
  const contadorAlertasRef = useRef<number>(0);
  const sincronizandoSalasRef = useRef<boolean>(false);

  // Une el socket global a una sala de proyecto específica sin duplicar solicitudes en la misma conexión
  const asegurarSalaProyecto = useCallback((idProyecto: number) => {
    if (!Number.isInteger(idProyecto) || idProyecto <= 0) return;

    salasPendientesRef.current.add(idProyecto);
    const socket = obtenerSocket();
    if (!socket?.connected) return;

    if (!salasSolicitadasRef.current.has(idProyecto)) {
      salasSolicitadasRef.current.add(idProyecto);
      mapaGpsSocketService.unirseProyecto(socket, idProyecto);
    }
  }, []);

  // Sincroniza todas las salas de proyectos accesibles para el admin o supervisor conectado
  const sincronizarSalas = useCallback(async () => {
    if (sincronizandoSalasRef.current) return;

    const socket = obtenerSocket();
    if (!socket?.connected || !sessionKeyActualRef.current) return;

    sincronizandoSalasRef.current = true;
    try {
      let listaProyectos: proyectoPatrullaje[] = [];
      try {
        listaProyectos = (await proyectosService.obtenerProyectos()) || [];
      } catch (error: unknown) {
        const errAxios = error as { response?: { status?: number } };
        // El backend responde 404 cuando el usuario aún no tiene proyectos creados/asignados
        if (errAxios.response?.status !== 404) {
          console.error('Error al obtener proyectos para salas WebSocket:', error);
        }
      }

      const idsAUnir = new Set<number>(salasPendientesRef.current);
      for (const proyecto of listaProyectos) {
        const idProyecto = Number(proyecto.id_proyecto);
        if (Number.isInteger(idProyecto) && idProyecto > 0) {
          if (proyecto.nombre_proyecto) {
            nombresProyectoRef.current[idProyecto] = proyecto.nombre_proyecto;
          }
          idsAUnir.add(idProyecto);
        }
      }

      const socketActual = obtenerSocket();
      if (!socketActual?.connected || !sessionKeyActualRef.current) return;

      for (const idProyecto of idsAUnir) {
        salasPendientesRef.current.add(idProyecto);
        if (!salasSolicitadasRef.current.has(idProyecto)) {
          salasSolicitadasRef.current.add(idProyecto);
          mapaGpsSocketService.unirseProyecto(socketActual, idProyecto);
        }
      }
    } finally {
      sincronizandoSalasRef.current = false;
    }
  }, []);

  // Limpia ubicaciones en caché de patrullajes que ya pasaron a Finalizado
  const limpiarUbicacionesFinalizadas = useCallback(
    (idProyecto: number, idsFinalizados: number[]) => {
      if (!Number.isInteger(idProyecto) || idsFinalizados.length === 0) return;

      const setFinalizados = new Set(idsFinalizados);
      setUbicacionesPorProyecto((prev) => {
        const actualesProyecto = prev[idProyecto];
        if (!actualesProyecto) return prev;

        let huboCambios = false;
        const filtradas: typeof actualesProyecto = {};

        for (const [rut, info] of Object.entries(actualesProyecto)) {
          if (info.id_patrullaje !== null && setFinalizados.has(Number(info.id_patrullaje))) {
            huboCambios = true;
          } else {
            filtradas[rut] = info;
          }
        }

        if (!huboCambios) return prev;
        return {
          ...prev,
          [idProyecto]: filtradas
        };
      });
    },
    []
  );

  // Desconecta el socket global y limpia listeners/caché de sesión
  const cerrarConexionGlobal = useCallback(() => {
    sessionKeyActualRef.current = null;
    removerListenersRef.current?.();
    removerListenersRef.current = null;
    salasSolicitadasRef.current.clear();
    salasPendientesRef.current.clear();
    nombresProyectoRef.current = {};
    desconectarSocket();
    setConectado(false);
    setSalasUnidas([]);
    setErrorSocket(null);
    setUbicacionesPorProyecto({});
    setAlertasPanico([]);
    setRolActivo('');
  }, []);

  useEffect(() => {
    let cancelado = false;

    const sincronizarSesionSocket = async () => {
      const [{ value: token }, usuario] = await Promise.all([
        Preferences.get({ key: 'token' }),
        obtenerUsuarioActual()
      ]);

      if (cancelado) return;

      const rol = (usuario?.tipo_rol || '').trim().toLowerCase();
      const enRutaSinSocket = RUTAS_SIN_SOCKET.has(location.pathname);

      if (!token || !usuario || !ROLES_GESTOR.has(rol) || enRutaSinSocket) {
        if (sessionKeyActualRef.current !== null || obtenerSocket()) {
          cerrarConexionGlobal();
        }
        return;
      }

      const matchProyecto = location.pathname.match(/\/(?:admin|supervisor)\/proyecto\/(\d+)/);
      const idProyectoRuta = matchProyecto ? Number(matchProyecto[1]) : null;

      const nuevoSessionKey = `${usuario.rut}:${rol}:${token}`;
      if (sessionKeyActualRef.current === nuevoSessionKey && obtenerSocket()) {
        if (idProyectoRuta) {
          asegurarSalaProyecto(idProyectoRuta);
        }
        if (location.pathname === '/admin/inicio' || location.pathname === '/supervisor/inicio') {
          void sincronizarSalas();
        }
        return;
      }

      cerrarConexionGlobal();
      sessionKeyActualRef.current = nuevoSessionKey;
      setRolActivo(rol);

      if (idProyectoRuta) {
        salasPendientesRef.current.add(idProyectoRuta);
      }

      const socket = conectarSocketConToken(token);
      removerListenersRef.current = mapaGpsSocketService.registrarListenersGlobales(socket, {
        onConectado: () => {
          salasSolicitadasRef.current.clear();
          setSalasUnidas([]);
          setConectado(true);
          setErrorSocket(null);
          void sincronizarSalas();
        },
        onDesconectado: () => {
          salasSolicitadasRef.current.clear();
          setConectado(false);
          setSalasUnidas([]);
        },
        onUnido: (respuesta) => {
          if (!respuesta?.ok) return;
          const idSala = Number(respuesta.data?.id_proyecto);
          if (!Number.isFinite(idSala)) return;
          setErrorSocket(null);
          setSalasUnidas((prev) => (prev.includes(idSala) ? prev : [...prev, idSala]));
        },
        onUbicacionPatrullero: (respuesta) => {
          if (!respuesta?.data) return;
          const datos = respuesta.data;
          const idProyecto = Number(datos.id_proyecto);
          const rutClave = (datos.rut || '').trim().toLowerCase();
          const lat = Number(datos.latitud);
          const lng = Number(datos.longitud);
          if (
            !Number.isFinite(idProyecto) ||
            !rutClave ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            return;
          }

          setUbicacionesPorProyecto((prev) => ({
            ...prev,
            [idProyecto]: {
              ...(prev[idProyecto] || {}),
              [rutClave]: {
                ...datos,
                id_proyecto: idProyecto,
                rut: rutClave,
                latitud: lat,
                longitud: lng
              }
            }
          }));
        },
        onAlertaPanico: (respuesta) => {
          if (!respuesta?.data) return;
          const datos = respuesta.data;
          const idProyecto = Number(datos.id_proyecto);
          const rutClave = (datos.rut || '').trim().toLowerCase();
          const lat = Number(datos.latitud);
          const lng = Number(datos.longitud);
          if (
            !Number.isFinite(idProyecto) ||
            !rutClave ||
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            return;
          }

          contadorAlertasRef.current += 1;
          const idAlerta = `${idProyecto}-${rutClave}-${contadorAlertasRef.current}`;
          const nombreProyecto =
            nombresProyectoRef.current[idProyecto] || `Proyecto #${idProyecto}`;

          setAlertasPanico((prev) => [
            ...prev,
            {
              ...datos,
              id_proyecto: idProyecto,
              rut: rutClave,
              latitud: lat,
              longitud: lng,
              idAlerta,
              nombreProyecto
            }
          ]);

          // Actualiza o crea el marcador del patrullero en alerta dentro del caché del mapa
          setUbicacionesPorProyecto((prev) => {
            const delProyecto = prev[idProyecto] || {};
            const existente = delProyecto[rutClave];
            return {
              ...prev,
              [idProyecto]: {
                ...delProyecto,
                [rutClave]: {
                  rut: rutClave,
                  nombre: datos.nombre || existente?.nombre || 'Patrullero',
                  id_proyecto: idProyecto,
                  id_patrullaje: existente?.id_patrullaje ?? null,
                  id_vehiculo: existente?.id_vehiculo ?? null,
                  hora_inicio: existente?.hora_inicio ?? null,
                  hora_termino: existente?.hora_termino ?? null,
                  latitud: lat,
                  longitud: lng,
                  fecha_actualizacion: datos.fecha_hora || new Date().toISOString()
                }
              }
            };
          });
        },
        onErrorSocket: (respuesta) => {
          console.error('Error en canal WebSocket global:', respuesta.message);
          setErrorSocket(respuesta.message || 'Error en el canal en tiempo real.');
        },
        onErrorConexion: (err) => {
          console.error('Error de conexión Socket.IO global:', err.message);
          setConectado(false);
          setSalasUnidas([]);
          setErrorSocket('No se pudo conectar al servidor en tiempo real.');
        }
      });

      if (socket.connected) {
        salasSolicitadasRef.current.clear();
        setConectado(true);
        setErrorSocket(null);
        void sincronizarSalas();
      }
    };

    void sincronizarSesionSocket();

    const manejarCambioSesion = () => {
      void sincronizarSesionSocket();
    };

    window.addEventListener('sipprem-sesion-actualizada', manejarCambioSesion);
    return () => {
      cancelado = true;
      window.removeEventListener('sipprem-sesion-actualizada', manejarCambioSesion);
    };
  }, [location.pathname, asegurarSalaProyecto, sincronizarSalas, cerrarConexionGlobal]);

  // Al desmontar por completo la aplicación (o en remount de StrictMode), cerramos la conexión global
  useEffect(() => {
    return () => {
      cerrarConexionGlobal();
    };
  }, [cerrarConexionGlobal]);

  const descartarAlertaPanico = useCallback((idAlerta: string) => {
    setAlertasPanico((prev) => prev.filter((item) => item.idAlerta !== idAlerta));
  }, []);

  const verAlertaEnMapa = useCallback(
    (alerta: AlertaPanicoRecibida) => {
      descartarAlertaPanico(alerta.idAlerta);
      if (!rolActivo) return;
      router.push(
        `/${rolActivo}/proyecto/${alerta.id_proyecto}/mapa?patrullero=${encodeURIComponent(
          alerta.rut
        )}&alerta=${encodeURIComponent(alerta.idAlerta)}`,
        'forward'
      );
    },
    [descartarAlertaPanico, rolActivo, router]
  );

  const valorContexto = useMemo(
    () => ({
      conectado,
      salasUnidas,
      errorSocket,
      ubicacionesPorProyecto,
      asegurarSalaProyecto,
      limpiarUbicacionesFinalizadas
    }),
    [
      conectado,
      salasUnidas,
      errorSocket,
      ubicacionesPorProyecto,
      asegurarSalaProyecto,
      limpiarUbicacionesFinalizadas
    ]
  );

  const alertaActual = alertasPanico.length > 0 ? alertasPanico[0] : null;

  return (
    <SocketGlobalContext.Provider value={valorContexto}>
      {children}
      <ModalAlertaPanico
        alerta={alertaActual}
        cantidadPendientes={alertasPanico.length}
        onVerEnMapa={verAlertaEnMapa}
        onDescartar={descartarAlertaPanico}
      />
    </SocketGlobalContext.Provider>
  );
};
