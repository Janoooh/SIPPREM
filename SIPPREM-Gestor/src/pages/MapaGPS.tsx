import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  IonIcon,
  IonSpinner,
  useIonAlert,
  useIonViewWillEnter,
  useIonViewWillLeave
} from '@ionic/react';
import {
  closeOutline,
  locateOutline,
  refreshOutline,
  timeOutline,
  carOutline,
  personOutline
} from 'ionicons/icons';
import { useLocation, useParams } from 'react-router-dom';
import L from 'leaflet';
import { MapContainer, Polygon, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import { convertirGeoJSONAPuntos, type PuntoMapa } from '../components/mapaPoligono';
import { useUsuario } from '../hooks/obtenerUsuario';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import { proyectosService } from '../services/proyectosService';
import { patrullajesService, PatrullajeProyecto } from '../services/patrullajesService';
import { useSocketGlobal } from '../context/socketContext';
import { CapaTilesMapa } from '../components/CapaTilesMapa';
import { AvisoErrorMapa } from '../components/AvisoErrorMapa';
import './MapaGPS.css';

const CENTRO_FALLBACK_CHILE: PuntoMapa = [-33.4489, -70.6693];

// Formatea fecha ISO a HH:MM en formato 24h
const formatearHora = (fechaIso: string | null | undefined): string => {
  if (!fechaIso) return '--:--';
  const fecha = new Date(fechaIso);
  return !Number.isNaN(fecha.getTime())
    ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
};

// Formatea la hora de la última señal recibida incluyendo segundos
const formatearHoraSenal = (fechaIso: string | null | undefined): string => {
  if (!fechaIso) return '--:--:--';
  const fecha = new Date(fechaIso);
  return !Number.isNaN(fecha.getTime())
    ? fecha.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '--:--:--';
};

// Ajusta el tamaño del lienzo Leaflet ante cambios de layout (ej. abrir/cerrar tarjeta lateral)
// y encuadra inicialmente las zonas activas o el polígono del proyecto sin interferir luego con el zoom manual
const AjustadorMapaGPS: React.FC<{
  puntosEncuadre: PuntoMapa[];
  claveProyecto: string;
}> = ({ puntosEncuadre, claveProyecto }) => {
  const map = useMap();
  const proyectoEncuadradoRef = useRef<string | null>(null);

  useEffect(() => {
    const actualizarTamano = () => {
      map.invalidateSize();
    };

    actualizarTamano();
    const t1 = setTimeout(actualizarTamano, 150);
    const t2 = setTimeout(actualizarTamano, 450);

    const resizeObserver = new ResizeObserver(actualizarTamano);
    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
    };
  }, [map]);

  useEffect(() => {
    if (puntosEncuadre.length === 0) return;
    if (proyectoEncuadradoRef.current === claveProyecto) return;

    const bounds = L.latLngBounds(puntosEncuadre);
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [28, 28], animate: false, maxZoom: 16 });
      proyectoEncuadradoRef.current = claveProyecto;
    }
  }, [map, puntosEncuadre, claveProyecto]);

  return null;
};

const MapaGPS: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const location = useLocation();
  const [mandarAlerta] = useIonAlert();

  const idProyectoNum = Number(id_proyecto);

  const {
    conectado,
    salasUnidas,
    errorSocket,
    ubicacionesPorProyecto,
    asegurarSalaProyecto,
    limpiarUbicacionesFinalizadas
  } = useSocketGlobal();

  const [proyecto, setProyecto] = useState<proyectoPatrullaje | null>(null);
  const [patrullajes, setPatrullajes] = useState<PatrullajeProyecto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [rutSeleccionado, setRutSeleccionado] = useState<string | null>(null);
  const [errorMapaBase, setErrorMapaBase] = useState<boolean>(false);
  const alertaEnfocadaRef = useRef<string | null>(null);

  // Carga el proyecto (para su zona base) y los patrullajes (para dibujar sectores "En curso")
  const cargarDatosMapa = useCallback(async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const [datosProyecto, datosPatrullajes] = await Promise.all([
        proyectosService.obtenerProyectoPorId(String(id_proyecto)),
        patrullajesService.obtenerPatrullajesProyecto(String(id_proyecto))
      ]);

      setProyecto(datosProyecto);
      const listaPatrullajes = datosPatrullajes || [];
      setPatrullajes(listaPatrullajes);

      // Si algún patrullaje ya pasó a Finalizado, limpiamos del caché global las señales asociadas a él
      const idsFinalizados = listaPatrullajes
        .filter((p) => (p.estado || '').trim().toLowerCase() === 'finalizado')
        .map((p) => Number(p.id_patrullaje))
        .filter((id) => Number.isFinite(id));

      if (idsFinalizados.length > 0 && Number.isInteger(idProyectoNum) && idProyectoNum > 0) {
        limpiarUbicacionesFinalizadas(idProyectoNum, idsFinalizados);
      }
    } catch (error: unknown) {
      const errAxios = error as { response?: { data?: { message?: string } } };
      console.error('Error al cargar datos del Mapa GPS:', error);
      mandarAlerta({
        header: 'Error',
        message:
          errAxios.response?.data?.message ||
          'No fue posible cargar la información geográfica del proyecto.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  }, [id_proyecto, idProyectoNum, mandarAlerta, limpiarUbicacionesFinalizadas]);

  // Al entrar a la vista cargamos el proyecto y aseguramos suscripción a su sala sin cerrar el socket al salir
  useIonViewWillEnter(() => {
    if (Number.isInteger(idProyectoNum) && idProyectoNum > 0) {
      asegurarSalaProyecto(idProyectoNum);
    }
    void cargarDatosMapa();
  });

  useIonViewWillLeave(() => {
    alertaEnfocadaRef.current = null;
  });

  useEffect(() => {
    if (Number.isInteger(idProyectoNum) && idProyectoNum > 0) {
      asegurarSalaProyecto(idProyectoNum);
    }
  }, [idProyectoNum, asegurarSalaProyecto]);

  const ubicacionesPorRut = useMemo(() => {
    if (!Number.isInteger(idProyectoNum) || idProyectoNum <= 0) return {};
    return ubicacionesPorProyecto[idProyectoNum] || {};
  }, [idProyectoNum, ubicacionesPorProyecto]);

  // Si llegamos desde "Ver en Mapa GPS" del modal de pánico, selecciona automáticamente al patrullero
  useEffect(() => {
    if (!location.search) return;
    const params = new URLSearchParams(location.search);
    const paramPatrullero = params.get('patrullero');
    if (!paramPatrullero) return;

    const claveAlerta = `${location.pathname}${location.search}`;
    if (alertaEnfocadaRef.current === claveAlerta) return;

    const rutNormalizado = paramPatrullero.trim().toLowerCase();
    if (rutNormalizado && ubicacionesPorRut[rutNormalizado]) {
      setRutSeleccionado(rutNormalizado);
      alertaEnfocadaRef.current = claveAlerta;
    }
  }, [location.pathname, location.search, ubicacionesPorRut]);

  const salaUnida =
    conectado && Number.isInteger(idProyectoNum) && salasUnidas.includes(idProyectoNum);

  // Polígono base del proyecto
  const puntosZonaProyecto = useMemo(
    () => convertirGeoJSONAPuntos(proyecto?.zona_seleccionada),
    [proyecto?.zona_seleccionada]
  );

  // Sectores de patrullajes actualmente "En curso" para graficarlos en verde sobre el mapa
  const zonasEnCurso = useMemo(() => {
    return patrullajes
      .filter((p) => (p.estado || '').trim().toLowerCase() === 'en curso')
      .map((p) => ({
        id_patrullaje: p.id_patrullaje,
        puntos: convertirGeoJSONAPuntos(p.zona)
      }))
      .filter((item) => item.puntos.length >= 3);
  }, [patrullajes]);

  const listaPatrullerosActivos = useMemo(
    () => Object.values(ubicacionesPorRut),
    [ubicacionesPorRut]
  );

  // Puntos combinados para calcular el encuadre inicial del mapa
  const puntosParaEncuadre = useMemo(() => {
    const puntosActivos = zonasEnCurso.flatMap((z) => z.puntos);
    if (puntosActivos.length > 0) return puntosActivos;
    if (puntosZonaProyecto.length >= 3) return puntosZonaProyecto;
    if (listaPatrullerosActivos.length > 0) {
      return listaPatrullerosActivos.map(
        (p): PuntoMapa => [p.latitud, p.longitud]
      );
    }
    return [];
  }, [zonasEnCurso, puntosZonaProyecto, listaPatrullerosActivos]);

  const patrulleroSeleccionado = useMemo(() => {
    if (!rutSeleccionado) return null;
    return ubicacionesPorRut[rutSeleccionado] || null;
  }, [rutSeleccionado, ubicacionesPorRut]);

  // Si la señal seleccionada dejó de existir tras limpiar patrullajes finalizados, cerramos la tarjeta
  useEffect(() => {
    if (rutSeleccionado && !ubicacionesPorRut[rutSeleccionado]) {
      setRutSeleccionado(null);
    }
  }, [rutSeleccionado, ubicacionesPorRut]);

  const centroInicialMapa =
    puntosParaEncuadre.length > 0 ? puntosParaEncuadre[0] : CENTRO_FALLBACK_CHILE;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="mapa-gps-grid ion-padding">
          <IonRow>
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto idProyecto={id_proyecto} rol={rol} opcionActiva="mapa" />
            </IonCol>

            <IonCol size="12" sizeMd="9" className="mapa-gps-contenido-col">
              {/* Cabecera superior con título del proyecto, estado en vivo y leyenda */}
              <div className="mapa-gps-topbar">
                <div>
                  <IonLabel className="mapa-gps-titulo">Mapa GPS en vivo</IonLabel>
                  {proyecto?.nombre_proyecto && (
                    <p className="mapa-gps-subtitulo">{proyecto.nombre_proyecto}</p>
                  )}
                </div>

                <div className="mapa-gps-controles">
                  <div
                    className={`mapa-estado-pill ${
                      errorSocket ? 'error' : salaUnida ? 'conectado' : 'conectando'
                    }`}
                  >
                    <span className="estado-dot" />
                    <span>
                      {errorSocket
                        ? errorSocket
                        : salaUnida
                          ? 'Canal en vivo activo'
                          : conectado
                            ? 'Uniéndose al proyecto...'
                            : 'Conectando en vivo...'}
                    </span>
                  </div>

                  <div className="mapa-contador-pill">
                    <span>
                      {listaPatrullerosActivos.length}{' '}
                      {listaPatrullerosActivos.length === 1
                        ? 'patrullero activo'
                        : 'patrulleros activos'}
                    </span>
                  </div>

                  <IonButton
                    fill="outline"
                    size="small"
                    className="btn-refrescar-mapa"
                    onClick={cargarDatosMapa}
                    disabled={cargando}
                  >
                    <IonIcon icon={refreshOutline} slot="start" />
                    Actualizar
                  </IonButton>
                </div>
              </div>

              {/* Leyenda visual compacta */}
              <div className="mapa-gps-leyenda">
                <span className="leyenda-chip">
                  <span className="leyenda-muestra zona" /> Sector en patrullaje
                </span>
                <span className="leyenda-chip">
                  <span className="leyenda-muestra patrullero" /> Patrullero activo
                </span>
                <span className="leyenda-chip">
                  <span className="leyenda-muestra seleccionado" /> Patrullero seleccionado
                </span>
              </div>

              {/* Contenedor principal: mapa central + bloque lateral al seleccionar un patrullero */}
              <div
                className={`mapa-gps-workspace ${
                  patrulleroSeleccionado ? 'con-detalle' : ''
                }`}
              >
                <div className="mapa-gps-canvas-card">
                  {cargando && !proyecto ? (
                    <div className="mapa-gps-loading">
                      <IonSpinner name="crescent" color="light" />
                      <span>Cargando mapa del proyecto...</span>
                    </div>
                  ) : (
                    <>
                      <MapContainer
                        center={centroInicialMapa}
                        zoom={15}
                        className="mapa-gps-leaflet"
                      >
                        <AjustadorMapaGPS
                          puntosEncuadre={puntosParaEncuadre}
                          claveProyecto={`${id_proyecto}-${zonasEnCurso.length > 0 ? 'en-curso' : 'base'}`}
                        />

                        <CapaTilesMapa onErrorChange={setErrorMapaBase} />

                        {/* Polígono general del proyecto como referencia sutil */}
                        {puntosZonaProyecto.length >= 3 && (
                          <Polygon
                            positions={puntosZonaProyecto}
                            interactive={false}
                            pathOptions={{
                              color: '#38bdf8',
                              fillColor: '#38bdf8',
                              fillOpacity: 0.08,
                              weight: 2,
                              dashArray: '6 6'
                            }}
                          />
                        )}

                        {/* Sectores de patrullajes actualmente en curso */}
                        {zonasEnCurso.map((zona) => (
                          <Polygon
                            key={zona.id_patrullaje}
                            positions={zona.puntos}
                            interactive={false}
                            pathOptions={{
                              color: '#16a34a',
                              fillColor: '#22c55e',
                              fillOpacity: 0.3,
                              weight: 3
                            }}
                          />
                        ))}

                        {/* Puntos de ubicación en vivo de cada patrullero activo */}
                        {listaPatrullerosActivos.map((patrullero) => {
                          const rutClave = patrullero.rut.toLowerCase();
                          const estaSeleccionado = rutSeleccionado === rutClave;
                          const posicion: PuntoMapa = [
                            patrullero.latitud,
                            patrullero.longitud
                          ];

                          return (
                            <React.Fragment key={rutClave}>
                              {estaSeleccionado && (
                                <CircleMarker
                                  center={posicion}
                                  radius={16}
                                  interactive={false}
                                  pathOptions={{
                                    color: '#ef4444',
                                    fillColor: '#ef4444',
                                    fillOpacity: 0.22,
                                    weight: 1.5
                                  }}
                                />
                              )}

                              <CircleMarker
                                center={posicion}
                                radius={estaSeleccionado ? 10 : 8}
                                pathOptions={
                                  estaSeleccionado
                                    ? {
                                        color: '#ef4444',
                                        fillColor: '#facc15',
                                        fillOpacity: 1,
                                        weight: 4
                                      }
                                    : {
                                        color: '#121c27',
                                        fillColor: '#facc15',
                                        fillOpacity: 1,
                                        weight: 2.5
                                      }
                                }
                                eventHandlers={{
                                  click: () => setRutSeleccionado(rutClave)
                                }}
                              >
                                <Tooltip direction="top" offset={[0, -8]}>
                                  {patrullero.nombre || patrullero.rut}
                                </Tooltip>
                              </CircleMarker>
                            </React.Fragment>
                          );
                        })}
                      </MapContainer>

                      {errorMapaBase && <AvisoErrorMapa />}

                      {listaPatrullerosActivos.length === 0 && (
                        <div className="mapa-sin-senales-badge">
                          <span>
                            Esperando señal GPS de patrulleros en curso...
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bloque derecho con la información del patrullero seleccionado */}
                {patrulleroSeleccionado && (
                  <aside className="detalle-patrullero-card">
                    <div className="detalle-card-header">
                      <span className="detalle-badge-en-curso">En patrullaje</span>
                      <IonButton
                        fill="clear"
                        size="small"
                        className="btn-cerrar-detalle"
                        onClick={() => setRutSeleccionado(null)}
                        aria-label="Cerrar detalle"
                      >
                        <IonIcon icon={closeOutline} slot="icon-only" />
                      </IonButton>
                    </div>

                    <div className="detalle-identidad">
                      <div className="detalle-avatar-circulo">
                        <IonIcon icon={personOutline} />
                      </div>
                      <div>
                        <h3 className="detalle-nombre-patrullero">
                          {patrulleroSeleccionado.nombre || 'Patrullero'}
                        </h3>
                        <span className="detalle-rut-patrullero">
                          RUT: {patrulleroSeleccionado.rut}
                        </span>
                      </div>
                    </div>

                    <div className="detalle-divisor" />

                    <div className="detalle-datos-lista">
                      <div className="detalle-dato-item">
                        <IonIcon icon={carOutline} className="detalle-dato-icono" />
                        <div>
                          <span className="detalle-dato-etiqueta">Patente</span>
                          <p className="detalle-dato-valor">
                            {patrulleroSeleccionado.id_vehiculo || 'No informada'}
                          </p>
                        </div>
                      </div>

                      <div className="detalle-dato-item">
                        <IonIcon icon={timeOutline} className="detalle-dato-icono" />
                        <div>
                          <span className="detalle-dato-etiqueta">
                            Patrullando desde las
                          </span>
                          <p className="detalle-dato-valor">
                            {formatearHora(patrulleroSeleccionado.hora_inicio)}
                          </p>
                        </div>
                      </div>

                      <div className="detalle-dato-item">
                        <IonIcon icon={timeOutline} className="detalle-dato-icono" />
                        <div>
                          <span className="detalle-dato-etiqueta">Hasta las</span>
                          <p className="detalle-dato-valor">
                            {formatearHora(patrulleroSeleccionado.hora_termino)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="detalle-footer-gps">
                      <div className="detalle-coords-row">
                        <IonIcon icon={locateOutline} />
                        <span>
                          {patrulleroSeleccionado.latitud.toFixed(5)},{' '}
                          {patrulleroSeleccionado.longitud.toFixed(5)}
                        </span>
                      </div>
                      <span className="detalle-ultima-senal">
                        Última señal:{' '}
                        {formatearHoraSenal(patrulleroSeleccionado.fecha_actualizacion)}
                      </span>
                    </div>
                  </aside>
                )}
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default MapaGPS;
