import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonButton,
  IonSpinner,
  useIonRouter,
  useIonAlert,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { useParams, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BarraNavInferior from '../components/barraNavInferior';
import {
  AjustadorMapa,
  convertirGeoJSONAPuntos,
  formatearHora,
  type PuntoMapa
} from '../components/PatrullajeCard';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import { usuarioService } from '../services/UsuarioService';
import { patrullajeService } from '../services/patrullajeService';
import { useMantenerPresionado } from '../hooks/useMantenerPresionado';
import {
  notificarCambioEstadoPatrullaje,
  useSeguimientoGlobal
} from '../context/seguimientoContext';
import { MAP_TILE_URL } from '../config/env';
import './PatrullajeActivo.css';

const DURACION_HOLD_PANICO_MS = 5000;

// Centra el mapa en la primera ubicación detectada cuando el patrullaje no trae polígono de zona
const CentradorInicialUbicacion: React.FC<{ punto: PuntoMapa; tieneZona: boolean }> = ({
  punto,
  tieneZona
}) => {
  const map = useMap();
  const [centradoInicial, setCentradoInicial] = useState(false);

  useEffect(() => {
    if (tieneZona || centradoInicial) return;
    map.setView(punto, 16, { animate: false });
    setCentradoInicial(true);
  }, [map, punto, tieneZona, centradoInicial]);

  return null;
};

const PatrullajeActivo: React.FC = () => {
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const location = useLocation();
  const idPatrullajeParam = new URLSearchParams(location.search).get('id_patrullaje');

  const {
    patrullajeEnCurso: patrullajeGlobal,
    ubicacion,
    errorUbicacion,
    salaUnida,
    errorSocket,
    enviandoPanico,
    sincronizarPatrullajeEnCurso,
    detenerSeguimientoPorFinalizacion,
    enviarAlertaPanico
  } = useSeguimientoGlobal();

  const [patrullaje, setPatrullaje] = useState<PatrullajeUsuario | null>(patrullajeGlobal);
  const [cargando, setCargando] = useState<boolean>(!patrullajeGlobal);
  const [finalizando, setFinalizando] = useState<boolean>(false);

  const mandarAlertaRef = useRef(mandarAlerta);
  const mandarToastRef = useRef(mandarToast);

  useEffect(() => {
    mandarAlertaRef.current = mandarAlerta;
  }, [mandarAlerta]);

  useEffect(() => {
    mandarToastRef.current = mandarToast;
  }, [mandarToast]);

  useIonViewWillEnter(() => {
    const cargarPatrullajeActivo = async () => {
      try {
        if (!patrullajeGlobal) {
          setCargando(true);
        }

        const [lista] = await Promise.all([
          usuarioService.obtenerPatrullajesUsuario(),
          sincronizarPatrullajeEnCurso()
        ]);

        const encontrado = idPatrullajeParam
          ? (lista || []).find((p) => Number(p.id_patrullaje) === Number(idPatrullajeParam))
          : (lista || []).find(
              (p) =>
                Number(p.id_proyecto) === Number(id_proyecto) &&
                (p.estado || '').trim().toLowerCase() === 'en curso'
            );

        setPatrullaje(encontrado || null);
      } catch (error) {
        console.error('Error al cargar el patrullaje en curso:', error);
        mandarAlertaRef.current({
          header: 'Aviso',
          message: 'No se pudo cargar la información del patrullaje activo.',
          buttons: ['Aceptar']
        });
      } finally {
        setCargando(false);
      }
    };

    void cargarPatrullajeActivo();
  });

  const patrullajeEnCurso =
    Boolean(patrullaje) && (patrullaje?.estado || '').trim().toLowerCase() === 'en curso';

  // Emite el evento "botonDePanico" por el WebSocket global tras completar 5 segundos de pulsación continua
  const dispararAlertaPanico = useCallback(async () => {
    if (enviandoPanico || finalizando || !patrullajeEnCurso) return;

    if (Capacitor.isNativePlatform()) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
      } catch {
        
      }
    }

    const idProyectoObjetivo = Number(id_proyecto || patrullaje?.id_proyecto);
    const resultado = await enviarAlertaPanico(idProyectoObjetivo);

    if (resultado.ok) {
      mandarToastRef.current({
        message: resultado.message,
        duration: 3500,
        position: 'top',
        color: 'success'
      });
      return;
    }

    mandarAlertaRef.current({
      header: resultado.tituloError || 'Error al enviar alerta',
      message: resultado.message,
      buttons: ['Aceptar']
    });
  }, [
    enviandoPanico,
    finalizando,
    patrullajeEnCurso,
    id_proyecto,
    patrullaje?.id_proyecto,
    enviarAlertaPanico
  ]);

  const avisarPulsacionCorta = useCallback(() => {
    mandarToastRef.current({
      message: 'Mantén presionado el botón de pánico durante 5 segundos para enviar la alerta.',
      duration: 2200,
      position: 'bottom',
      color: 'warning'
    });
  }, []);

  const {
    presionando: presionandoPanico,
    progreso: progresoPanico,
    segundosRestantes: segundosRestantesPanico,
    handlers: panicoHandlers
  } = useMantenerPresionado({
    duracionMs: DURACION_HOLD_PANICO_MS,
    deshabilitado: !patrullajeEnCurso || finalizando || enviandoPanico,
    onCompletado: () => {
      void dispararAlertaPanico();
    },
    onCanceladoTemprano: avisarPulsacionCorta
  });

  const puntosZona = useMemo(
    () => convertirGeoJSONAPuntos(patrullaje?.zona),
    [patrullaje?.zona]
  );

  // Coordenada en formato [latitud, longitud] para graficar la posición del patrullero en Leaflet
  const puntoUsuario: PuntoMapa | null = useMemo(
    () => (ubicacion ? [ubicacion.latitud, ubicacion.longitud] : null),
    [ubicacion]
  );

  const centroInicialMapa = puntosZona.length >= 3 ? puntosZona[0] : puntoUsuario;

  const handleReportarIncidente = () => {
    mandarToast({
      message: 'Módulo de reporte de incidentes disponible próximamente.',
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
  };

  const ejecutarFinalizacion = async () => {
    const idPatrullajeObjetivo = Number(idPatrullajeParam || patrullaje?.id_patrullaje);
    const idProyectoObjetivo = id_proyecto || (patrullaje ? String(patrullaje.id_proyecto) : '');

    if (!idProyectoObjetivo || !idPatrullajeObjetivo || Number.isNaN(idPatrullajeObjetivo)) {
      mandarAlerta({
        header: 'Error',
        message: 'Faltan datos del patrullaje o del proyecto para finalizar.',
        buttons: ['Aceptar']
      });
      return;
    }

    try {
      setFinalizando(true);
      await patrullajeService.finalizarPatrullaje(idProyectoObjetivo, idPatrullajeObjetivo);

      // Detenemos el GPS y el socket global de inmediato al finalizar el patrullaje
      detenerSeguimientoPorFinalizacion();
      notificarCambioEstadoPatrullaje();

      mandarToast({
        message: '¡Patrullaje finalizado correctamente!',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });

      router.push('/patrullero/inicio', 'back');
    } catch (error: unknown) {
      const errAxios = error as {
        response?: { data?: { message?: string; explicacion?: string } };
        message?: string;
      };
      const mensajeBackend =
        errAxios.response?.data?.message ||
        errAxios.response?.data?.explicacion ||
        errAxios.message ||
        'No fue posible finalizar el patrullaje.';

      mandarAlerta({
        header: 'Error al finalizar',
        message: mensajeBackend,
        buttons: ['Aceptar']
      });
    } finally {
      setFinalizando(false);
    }
  };

  const handleConfirmarTermino = () => {
    mandarAlerta({
      header: 'Confirmar término',
      message: '¿Estás seguro de que deseas terminar este patrullaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Terminar',
          role: 'destructive',
          handler: () => {
            ejecutarFinalizacion();
          }
        }
      ]
    });
  };

  const obtenerTextoEstadoGPS = () => {
    if (errorUbicacion) {
      return { clase: 'alerta', texto: errorUbicacion };
    }
    if (errorSocket) {
      return { clase: 'alerta', texto: errorSocket };
    }
    if (ubicacion && salaUnida) {
      return { clase: 'activo', texto: 'Ubicación en vivo conectada y enviando al gestor' };
    }
    if (ubicacion) {
      return { clase: 'conectando', texto: 'Ubicación detectada · conectando envío en vivo...' };
    }
    return { clase: 'conectando', texto: 'Obteniendo ubicación del dispositivo...' };
  };

  const estadoGps = obtenerTextoEstadoGPS();

  return (
    <IonPage>
      <IonContent fullscreen className="patrullaje-activo-content">
        <div className="patrullaje-activo-container">
          <div className="activo-header">
            <h1 className="activo-titulo">En patrullaje</h1>
            {patrullaje?.nombre_proyecto && (
              <p className="activo-proyecto">{patrullaje.nombre_proyecto}</p>
            )}
          </div>

          <div className="activo-mapa-box">
            {cargando ? (
              <div className="activo-mapa-estado">
                <IonSpinner name="crescent" color="light" />
              </div>
            ) : centroInicialMapa ? (
              <MapContainer
                center={centroInicialMapa}
                zoom={15}
                className="activo-mapa-leaflet"
              >
                {puntosZona.length >= 3 ? (
                  <AjustadorMapa puntos={puntosZona} padding={[20, 20]} />
                ) : (
                  <CentradorInicialUbicacion punto={centroInicialMapa} tieneZona={false} />
                )}

                <TileLayer
                  url={MAP_TILE_URL}
                  attribution="&copy; OpenStreetMap contributors"
                />

                {puntosZona.length >= 3 && (
                  <Polygon
                    positions={puntosZona}
                    interactive={false}
                    pathOptions={{
                      color: '#16a34a',
                      fillColor: '#22c55e',
                      fillOpacity: 0.35,
                      weight: 3
                    }}
                  />
                )}

                {/* Grafica la posición en tiempo real del patrullero en el mapa */}
                {puntoUsuario && (
                  <>
                    <CircleMarker
                      center={puntoUsuario}
                      radius={15}
                      interactive={false}
                      pathOptions={{
                        color: '#38bdf8',
                        fillColor: '#38bdf8',
                        fillOpacity: 0.25,
                        weight: 1
                      }}
                    />
                    <CircleMarker
                      center={puntoUsuario}
                      radius={7}
                      pathOptions={{
                        color: '#ffffff',
                        fillColor: '#0ea5e9',
                        fillOpacity: 1,
                        weight: 2.5
                      }}
                    >
                      <Popup>Tu ubicación actual</Popup>
                    </CircleMarker>
                  </>
                )}
              </MapContainer>
            ) : (
              <div className="activo-mapa-estado">
                <span>Zona de patrullaje no disponible</span>
              </div>
            )}
          </div>

          {patrullajeEnCurso && (
            <div className={`activo-estado-gps ${estadoGps.clase}`}>
              <span className="gps-indicador-punto" />
              <span>{estadoGps.texto}</span>
            </div>
          )}

          <div className="activo-horarios">
            <p>
              Iniciado a las <strong>{formatearHora(patrullaje?.hora_inicio || '')}</strong>
            </p>
            <p>
              Termina a las <strong>{formatearHora(patrullaje?.hora_termino || '')}</strong>
            </p>
          </div>

          <div className="activo-acciones-wrapper">
            <div className="activo-botones-grid">
              <IonButton
                expand="block"
                className="btn-activo-incidente"
                onClick={handleReportarIncidente}
              >
                Reportar incidente
              </IonButton>

              {/* Requiere mantener presionado 5 segundos para emitir "botonDePanico" */}
              <div
                className={`panico-boton-wrapper ${presionandoPanico ? 'manteniendo' : ''}`}
                {...panicoHandlers}
              >
                <IonButton
                  expand="block"
                  className="btn-activo-panico"
                  disabled={!patrullajeEnCurso || finalizando || enviandoPanico}
                >
                  {enviandoPanico
                    ? 'Enviando alerta...'
                    : presionandoPanico
                      ? `Mantén ${segundosRestantesPanico}s...`
                      : 'Botón de pánico'}
                </IonButton>

                {presionandoPanico && (
                  <div className="panico-progreso-overlay" aria-hidden="true">
                    <div
                      className="panico-progreso-fill"
                      style={{ width: `${progresoPanico}%` }}
                    />
                    <div
                      className="panico-progreso-barra"
                      style={{ width: `${progresoPanico}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            <IonButton
              expand="block"
              className="btn-activo-terminar"
              disabled={finalizando}
              onClick={handleConfirmarTermino}
            >
              {finalizando ? 'Terminando...' : 'Terminar patrullaje'}
            </IonButton>
          </div>
        </div>
      </IonContent>

      <BarraNavInferior id_proyecto={id_proyecto} />
    </IonPage>
  );
};

export default PatrullajeActivo;
