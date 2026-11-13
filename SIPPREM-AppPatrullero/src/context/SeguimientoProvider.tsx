import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { obtenerUsuarioActual } from '../hooks/obtenerUsuario';
import { useSeguimientoUbicacion } from '../hooks/useSeguimientoUbicacion';
import type { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import { usuarioService } from '../services/UsuarioService';
import {
  conectarSocketConToken,
  desconectarSocket,
  obtenerSocket
} from '../services/socketClient';
import { patrullajeSocketService } from '../services/patrullajeSocketService';
import {
  EVENTO_ESTADO_PATRULLAJE,
  EVENTO_SESION_PATRULLERO,
  SeguimientoContext,
  type ResultadoEnvioPanico
} from './seguimientoContext';

const RUTAS_SIN_SEGUIMIENTO = new Set(['/login', '/cambiar-clave-inicial']);
const TIMEOUT_ACK_PANICO_MS = 6000;

export const SeguimientoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  const [sesionValida, setSesionValida] = useState<boolean>(false);
  const [tokenSesion, setTokenSesion] = useState<string | null>(null);
  const [patrullajeEnCurso, setPatrullajeEnCurso] = useState<PatrullajeUsuario | null>(null);
  const [cargandoEstado, setCargandoEstado] = useState<boolean>(false);

  const [salaUnida, setSalaUnida] = useState<boolean>(false);
  const [errorSocket, setErrorSocket] = useState<string | null>(null);
  const [enviandoPanico, setEnviandoPanico] = useState<boolean>(false);

  const sessionKeyRef = useRef<string | null>(null);
  const removerListenersRef = useRef<(() => void) | null>(null);
  const idProyectoSalaRef = useRef<number | null>(null);
  const consultaActivaRef = useRef<Promise<PatrullajeUsuario | null> | null>(null);

  const panicoPendienteRef = useRef<boolean>(false);
  const panicoResolverRef = useRef<((res: ResultadoEnvioPanico) => void) | null>(null);
  const timeoutPanicoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const limpiarTimeoutPanico = useCallback(() => {
    if (timeoutPanicoRef.current !== null) {
      clearTimeout(timeoutPanicoRef.current);
      timeoutPanicoRef.current = null;
    }
  }, []);

  const resolverPanicoPendiente = useCallback(
    (resultado: ResultadoEnvioPanico) => {
      limpiarTimeoutPanico();
      panicoPendienteRef.current = false;
      setEnviandoPanico(false);
      const resolver = panicoResolverRef.current;
      panicoResolverRef.current = null;
      resolver?.(resultado);
    },
    [limpiarTimeoutPanico]
  );

  // Cierra el socket global y resetea el estado de sala (sin perder la lógica al cambiar de pantalla)
  const cerrarSocketGlobal = useCallback(() => {
    if (panicoPendienteRef.current) {
      resolverPanicoPendiente({
        ok: false,
        tituloError: 'Conexión interrumpida',
        message: 'Se cerró la conexión en tiempo real antes de confirmar la alerta de pánico.'
      });
    }
    removerListenersRef.current?.();
    removerListenersRef.current = null;
    idProyectoSalaRef.current = null;
    setSalaUnida(false);
    setErrorSocket(null);
    desconectarSocket();
  }, [resolverPanicoPendiente]);

  // Consulta al backend si el patrullero autenticado tiene exactamente 1 patrullaje "En curso"
  const sincronizarPatrullajeEnCurso = useCallback(async (): Promise<PatrullajeUsuario | null> => {
    if (!sessionKeyRef.current) {
      setPatrullajeEnCurso(null);
      return null;
    }

    if (consultaActivaRef.current) {
      return consultaActivaRef.current;
    }

    const ejecucion = (async () => {
      try {
        setCargandoEstado(true);
        const lista = await usuarioService.obtenerPatrullajesUsuario();
        if (!sessionKeyRef.current) return null;

        const enCurso =
          (lista || []).find(
            (p) => (p.estado || '').trim().toLowerCase() === 'en curso'
          ) || null;

        setPatrullajeEnCurso((prev) => {
          if (
            prev?.id_patrullaje === enCurso?.id_patrullaje &&
            prev?.id_proyecto === enCurso?.id_proyecto &&
            prev?.estado === enCurso?.estado
          ) {
            return prev;
          }
          return enCurso;
        });

        return enCurso;
      } catch (error) {
        console.error('Error al verificar patrullaje en curso global:', error);
        return null;
      } finally {
        setCargandoEstado(false);
        consultaActivaRef.current = null;
      }
    })();

    consultaActivaRef.current = ejecucion;
    return ejecucion;
  }, []);

  // Corta inmediatamente el seguimiento global y el socket cuando el patrullero finaliza su turno
  const detenerSeguimientoPorFinalizacion = useCallback(() => {
    setPatrullajeEnCurso(null);
    cerrarSocketGlobal();
  }, [cerrarSocketGlobal]);

  // Mantiene sincronizada la sesión del patrullero y verifica si tiene un patrullaje "En curso"
  useEffect(() => {
    let cancelado = false;

    const verificarSesionYPatrullaje = async () => {
      const [{ value: token }, usuario] = await Promise.all([
        Preferences.get({ key: 'token' }),
        obtenerUsuarioActual()
      ]);

      if (cancelado) return;

      const rol = (usuario?.tipo_rol || '').trim().toLowerCase();
      const enRutaPublica = RUTAS_SIN_SEGUIMIENTO.has(location.pathname);

      if (!token || !usuario || rol !== 'patrullero' || enRutaPublica) {
        sessionKeyRef.current = null;
        setSesionValida(false);
        setTokenSesion(null);
        setPatrullajeEnCurso(null);
        cerrarSocketGlobal();
        return;
      }

      const nuevaSessionKey = `${usuario.rut}:${rol}:${token}`;
      const cambioSesion = sessionKeyRef.current !== nuevaSessionKey;
      sessionKeyRef.current = nuevaSessionKey;

      if (cambioSesion) {
        cerrarSocketGlobal();
        setSesionValida(true);
        setTokenSesion(token);
      }

      await sincronizarPatrullajeEnCurso();
    };

    void verificarSesionYPatrullaje();

    const manejarEventoSincronizacion = () => {
      void verificarSesionYPatrullaje();
    };

    const manejarVisibilidad = () => {
      if (document.visibilityState === 'visible') {
        void verificarSesionYPatrullaje();
      }
    };

    window.addEventListener(EVENTO_SESION_PATRULLERO, manejarEventoSincronizacion);
    window.addEventListener(EVENTO_ESTADO_PATRULLAJE, manejarEventoSincronizacion);
    document.addEventListener('visibilitychange', manejarVisibilidad);

    return () => {
      cancelado = true;
      window.removeEventListener(EVENTO_SESION_PATRULLERO, manejarEventoSincronizacion);
      window.removeEventListener(EVENTO_ESTADO_PATRULLAJE, manejarEventoSincronizacion);
      document.removeEventListener('visibilitychange', manejarVisibilidad);
    };
  }, [location.pathname, cerrarSocketGlobal, sincronizarPatrullajeEnCurso]);

  // GPS activo en toda la aplicación únicamente mientras el usuario logeado tenga 1 patrullaje "En curso"
  const seguimientoActivo = Boolean(sesionValida && tokenSesion && patrullajeEnCurso);
  const { ubicacion, errorUbicacion } = useSeguimientoUbicacion(seguimientoActivo);

  // Gestiona el socket global mientras exista un patrullaje "En curso"; lo cierra al finalizar o cerrar sesión
  useEffect(() => {
    const idProyecto = Number(patrullajeEnCurso?.id_proyecto);
    if (!seguimientoActivo || !tokenSesion || !idProyecto || Number.isNaN(idProyecto)) {
      cerrarSocketGlobal();
      return;
    }

    const socketExistente = obtenerSocket();
    // Si ya estamos conectados y suscritos al mismo proyecto, no reiniciamos el socket al cambiar de vista
    if (socketExistente && idProyectoSalaRef.current === idProyecto && removerListenersRef.current) {
      if (!socketExistente.connected) {
        socketExistente.connect();
      }
      return;
    }

    cerrarSocketGlobal();
    idProyectoSalaRef.current = idProyecto;

    const socket = conectarSocketConToken(tokenSesion);
    removerListenersRef.current = patrullajeSocketService.registrarListenersSala(socket, {
      onConectado: () => {
        setSalaUnida(false);
        setErrorSocket(null);
        patrullajeSocketService.unirseProyecto(socket, idProyecto);
      },
      onDesconectado: () => {
        setSalaUnida(false);
        if (panicoPendienteRef.current) {
          resolverPanicoPendiente({
            ok: false,
            tituloError: 'Conexión interrumpida',
            message: 'Se perdió la conexión en tiempo real antes de confirmar la alerta de pánico.'
          });
        }
      },
      onUnido: (respuesta) => {
        if (respuesta.ok) {
          setSalaUnida(true);
          setErrorSocket(null);
        }
      },
      onAlertaPanicoEnviada: (respuesta) => {
        if (panicoPendienteRef.current) {
          resolverPanicoPendiente({
            ok: true,
            message:
              respuesta.message ||
              '¡Alerta de pánico enviada al supervisor del proyecto!'
          });
        }
      },
      onErrorSocket: (respuesta) => {
        console.error('Error en canal WebSocket global del patrullero:', respuesta.message);
        if (panicoPendienteRef.current) {
          resolverPanicoPendiente({
            ok: false,
            tituloError: 'Error al enviar alerta',
            message: respuesta.message || 'No se pudo emitir la alerta de pánico.'
          });
          return;
        }
        setSalaUnida(false);
        setErrorSocket(respuesta.message || 'Error en el canal en tiempo real.');
      },
      onErrorConexion: (err) => {
        console.error('Error de conexión Socket.IO del patrullero:', err.message);
        setSalaUnida(false);
        setErrorSocket('No se pudo conectar al servidor en tiempo real.');
        if (panicoPendienteRef.current) {
          resolverPanicoPendiente({
            ok: false,
            tituloError: 'Sin conexión en vivo',
            message: 'No se pudo conectar al servidor para enviar la alerta de pánico.'
          });
        }
      }
    });

    if (socket.connected) {
      patrullajeSocketService.unirseProyecto(socket, idProyecto);
    }
  }, [
    seguimientoActivo,
    tokenSesion,
    patrullajeEnCurso?.id_proyecto,
    cerrarSocketGlobal,
    resolverPanicoPendiente
  ]);

  // Al desmontar por completo la aplicación (o en remount de StrictMode), desconectamos el socket global
  useEffect(() => {
    return () => {
      cerrarSocketGlobal();
    };
  }, [cerrarSocketGlobal]);

  // Emite continuamente la ubicación por WebSocket mientras exista patrullaje en curso y sala activa
  useEffect(() => {
    const socket = obtenerSocket();
    if (!seguimientoActivo || !patrullajeEnCurso || !salaUnida || !ubicacion || !socket?.connected) {
      return;
    }

    patrullajeSocketService.enviarUbicacion(socket, {
      id_proyecto: Number(patrullajeEnCurso.id_proyecto),
      id_patrullaje: patrullajeEnCurso.id_patrullaje ?? null,
      id_vehiculo: null,
      hora_inicio: patrullajeEnCurso.hora_inicio ?? null,
      hora_termino: patrullajeEnCurso.hora_termino ?? null,
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud
    });
  }, [seguimientoActivo, patrullajeEnCurso, salaUnida, ubicacion]);

  // Envía el evento "botonDePanico" por el socket global y espera la confirmación del servidor
  const enviarAlertaPanico = useCallback(
    async (idProyectoPreferido?: number): Promise<ResultadoEnvioPanico> => {
      if (panicoPendienteRef.current) {
        return {
          ok: false,
          tituloError: 'Envío en curso',
          message: 'Ya se está procesando una alerta de pánico.'
        };
      }

      const idProyectoObjetivo = Number(
        idProyectoPreferido || patrullajeEnCurso?.id_proyecto
      );
      if (!idProyectoObjetivo || Number.isNaN(idProyectoObjetivo)) {
        return {
          ok: false,
          tituloError: 'Error',
          message:
            'No se pudo identificar el proyecto activo para enviar la alerta de pánico.'
        };
      }

      if (
        !ubicacion ||
        !Number.isFinite(ubicacion.latitud) ||
        !Number.isFinite(ubicacion.longitud)
      ) {
        return {
          ok: false,
          tituloError: 'Ubicación requerida',
          message:
            'Aún no se obtiene la ubicación GPS del dispositivo para adjuntarla a la alerta de pánico.'
        };
      }

      const socket = obtenerSocket();
      if (!socket?.connected || !salaUnida) {
        return {
          ok: false,
          tituloError: 'Sin conexión en vivo',
          message:
            'El canal en tiempo real aún no está conectado al proyecto. Intenta nuevamente en unos segundos.'
        };
      }

      return new Promise<ResultadoEnvioPanico>((resolve) => {
        limpiarTimeoutPanico();
        panicoPendienteRef.current = true;
        panicoResolverRef.current = resolve;
        setEnviandoPanico(true);

        timeoutPanicoRef.current = setTimeout(() => {
          if (!panicoPendienteRef.current) return;
          resolverPanicoPendiente({
            ok: false,
            tituloError: 'Confirmación pendiente',
            message:
              'No se recibió confirmación del servidor tras enviar la alerta de pánico. Verifica tu conexión.'
          });
        }, TIMEOUT_ACK_PANICO_MS);

        patrullajeSocketService.enviarAlertaPanico(socket, {
          id_proyecto: idProyectoObjetivo,
          latitud: ubicacion.latitud,
          longitud: ubicacion.longitud
        });
      });
    },
    [
      patrullajeEnCurso?.id_proyecto,
      ubicacion,
      salaUnida,
      limpiarTimeoutPanico,
      resolverPanicoPendiente
    ]
  );

  const valorContexto = useMemo(
    () => ({
      patrullajeEnCurso,
      cargandoEstado,
      ubicacion,
      errorUbicacion,
      salaUnida,
      errorSocket,
      enviandoPanico,
      sincronizarPatrullajeEnCurso,
      detenerSeguimientoPorFinalizacion,
      enviarAlertaPanico
    }),
    [
      patrullajeEnCurso,
      cargandoEstado,
      ubicacion,
      errorUbicacion,
      salaUnida,
      errorSocket,
      enviandoPanico,
      sincronizarPatrullajeEnCurso,
      detenerSeguimientoPorFinalizacion,
      enviarAlertaPanico
    ]
  );

  return (
    <SeguimientoContext.Provider value={valorContexto}>
      {children}
    </SeguimientoContext.Provider>
  );
};
