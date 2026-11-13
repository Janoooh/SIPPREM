import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Geolocation, type CallbackID, type Position } from '@capacitor/geolocation';
import type { CoordenadasDispositivo } from '../interfaces/ubicacionSocket';

const OPCIONES_GPS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 3000,
  minimumUpdateInterval: 3000,
  interval: 5000
};

/**
 * Traduce los errores comunes de geolocalización (Web y Capacitor nativo)
 * a mensajes comprensibles para el usuario.
 */
const obtenerMensajeErrorGPS = (error: unknown): string => {
  const errorObj = typeof error === 'object' && error !== null ? (error as { message?: unknown; code?: unknown }) : {};
  const mensaje = String(errorObj.message || '').toLowerCase();
  const codigo = Number(errorObj.code);

  if (codigo === 1 || mensaje.includes('denied') || mensaje.includes('permission')) {
    return 'Permiso de ubicación denegado. Actívalo para mostrar y enviar tu posición.';
  }

  if (codigo === 2 || mensaje.includes('unavailable') || mensaje.includes('disabled')) {
    return 'Servicio de ubicación no disponible o desactivado en el dispositivo.';
  }

  if (codigo === 3 || mensaje.includes('timeout')) {
    return 'Tiempo de espera agotado al obtener la ubicación GPS.';
  }

  return 'No fue posible obtener la ubicación del dispositivo.';
};

/**
 * Hook encargado de solicitar permisos, capturar la posición inicial y observar
 * los cambios de ubicación del dispositivo con @capacitor/geolocation (Web y Android).
 */
export const useSeguimientoUbicacion = (activo: boolean) => {
  const [ubicacion, setUbicacion] = useState<CoordenadasDispositivo | null>(null);
  const [errorUbicacion, setErrorUbicacion] = useState<string | null>(null);
  const [rastreando, setRastreando] = useState<boolean>(false);

  useEffect(() => {
    if (!activo) {
      setRastreando(false);
      setUbicacion(null);
      return;
    }

    let cancelado = false;
    let watchId: CallbackID | null = null;

    // Convierte la posición entregada por Capacitor al formato interno del mapa y socket
    const actualizarPosicion = (posicion: Position) => {
      if (cancelado) return;

      setUbicacion({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        precision: posicion.coords.accuracy ?? null
      });
      setErrorUbicacion(null);
      setRastreando(true);
    };

    const iniciarSeguimiento = async () => {
      try {
        setErrorUbicacion(null);

        // En plataformas nativas (Android/iOS) solicitamos el permiso explícitamente;
        // en Web el navegador abre el prompt automáticamente al consultar la posición.
        if (Capacitor.isNativePlatform()) {
          const estadoActual = await Geolocation.checkPermissions();
          const tienePermiso =
            estadoActual.location === 'granted' || estadoActual.coarseLocation === 'granted';

          if (!tienePermiso) {
            const solicitud = await Geolocation.requestPermissions();
            const concedido =
              solicitud.location === 'granted' || solicitud.coarseLocation === 'granted';

            if (!concedido) {
              if (!cancelado) {
                setErrorUbicacion(
                  'Permiso de ubicación denegado. Actívalo para mostrar y enviar tu posición.'
                );
                setRastreando(false);
              }
              return;
            }
          }
        }

        // Obtenemos una primera lectura rápida para graficar al instante al entrar
        try {
          const posicionInicial = await Geolocation.getCurrentPosition(OPCIONES_GPS);
          actualizarPosicion(posicionInicial);
        } catch (errorInicial) {
          // Si falla la lectura inicial puntual, intentamos igualmente mantener el watch activo
          if (!cancelado) {
            setErrorUbicacion(obtenerMensajeErrorGPS(errorInicial));
          }
        }

        if (cancelado) return;

        // Iniciamos la suscripción continua a cambios de ubicación del dispositivo
        const idSuscripcion = await Geolocation.watchPosition(
          OPCIONES_GPS,
          (posicion, error) => {
            if (cancelado) return;

            if (error) {
              setErrorUbicacion(obtenerMensajeErrorGPS(error));
              return;
            }

            if (posicion) {
              actualizarPosicion(posicion);
            }
          }
        );

        // Si la vista se cerró mientras se registraba el watcher, lo liberamos de inmediato
        if (cancelado) {
          await Geolocation.clearWatch({ id: idSuscripcion });
          return;
        }

        watchId = idSuscripcion;
        setRastreando(true);
      } catch (error) {
        if (!cancelado) {
          setErrorUbicacion(obtenerMensajeErrorGPS(error));
          setRastreando(false);
        }
      }
    };

    iniciarSeguimiento();

    // Limpieza obligatoria al salir de la pantalla o desactivar el seguimiento
    return () => {
      cancelado = true;
      setRastreando(false);

      if (watchId !== null) {
        const idALiberar = watchId;
        watchId = null;
        Geolocation.clearWatch({ id: idALiberar }).catch((err) => {
          console.error('Error al limpiar watchPosition:', err);
        });
      }
    };
  }, [activo]);

  return { ubicacion, errorUbicacion, rastreando };
};
