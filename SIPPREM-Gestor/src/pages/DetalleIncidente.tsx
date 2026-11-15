import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonSpinner,
  useIonAlert,
  useIonRouter,
  useIonViewWillEnter
} from '@ionic/react';
import {
  alertCircleOutline,
  arrowBackOutline,
  calendarOutline,
  imagesOutline,
  locateOutline,
  personOutline,
  shieldCheckmarkOutline,
  timeOutline
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { isAxiosError } from 'axios';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import { CapaTilesMapa } from '../components/CapaTilesMapa';
import { AvisoErrorMapa } from '../components/AvisoErrorMapa';
import { useUsuario } from '../hooks/obtenerUsuario';
import { IncidenteProyecto, incidentesService } from '../services/incidentesService';
import '../components/IncidentesCard.css';
import './DetalleIncidente.css';

const DESCRIPCIONES_GRAVEDAD: Record<number, { etiqueta: string; detalle: string }> = {
  1: { etiqueta: 'Nivel 1 - Muy baja', detalle: 'Situación menor o preventiva sin riesgo inmediato' },
  2: { etiqueta: 'Nivel 2 - Baja', detalle: 'Incidencia leve que requiere registro y seguimiento' },
  3: { etiqueta: 'Nivel 3 - Media', detalle: 'Situación moderada que afecta la convivencia o el entorno' },
  4: { etiqueta: 'Nivel 4 - Alta', detalle: 'Incidente relevante que requiere pronta atención municipal' },
  5: { etiqueta: 'Nivel 5 - Crítica', detalle: 'Urgencia grave o de alto impacto para la seguridad vecinal' }
};

const extraerCoordenadasPunto = (ubicacion: IncidenteProyecto['ubicacion']): [number, number] | null => {
  if (!ubicacion) return null;

  try {
    const geo = typeof ubicacion === 'string' ? JSON.parse(ubicacion) : ubicacion;
    if (geo?.type === 'Point' && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      const lng = Number(geo.coordinates[0]);
      const lat = Number(geo.coordinates[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        return [lat, lng];
      }
    }
  } catch {
    return null;
  }

  return null;
};

const formatearFecha = (fechaIso?: string): string => {
  if (!fechaIso) return 'No disponible';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'No disponible';
  return fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
};

const formatearHora = (fechaIso?: string): string => {
  if (!fechaIso) return '--:--';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return '--:--';
  return `${fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })} hrs`;
};

const AjustadorMapaDetalle: React.FC<{ punto: [number, number] }> = ({ punto }) => {
  const map = useMap();

  useEffect(() => {
    const actualizarVista = () => {
      map.invalidateSize();
      map.setView(punto, 16, { animate: false });
    };

    actualizarVista();
    const t1 = setTimeout(actualizarVista, 150);
    const t2 = setTimeout(actualizarVista, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, punto]);

  return null;
};

const DetalleIncidente: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto, id_incidente } = useParams<{
    id_proyecto: string;
    id_incidente: string;
  }>();
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  const [incidente, setIncidente] = useState<IncidenteProyecto | null>(null);
  const [fotos, setFotos] = useState<string[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorMapaBase, setErrorMapaBase] = useState<boolean>(false);
  const [indiceFotoActiva, setIndiceFotoActiva] = useState<number | null>(null);

  const volverAlHistorial = useCallback(() => {
    router.push(`/${rolRuta}/proyecto/${id_proyecto}/historial`, 'back');
  }, [router, rolRuta, id_proyecto]);

  const cargarDetalle = useCallback(async () => {
    if (!id_proyecto || !id_incidente) return;
    try {
      setCargando(true);
      const respuesta = await incidentesService.obtenerIncidentePorId(id_proyecto, id_incidente);
      setIncidente(respuesta?.incidente || null);
      setFotos(Array.isArray(respuesta?.fotos) ? respuesta.fotos : []);
    } catch (error: unknown) {
      let mensajeError = 'No fue posible obtener la información del incidente.';
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string; explicacion?: string } | undefined;
        mensajeError = data?.message || data?.explicacion || mensajeError;
      }
      mandarAlerta({
        header: 'Error al cargar incidente',
        message: mensajeError,
        buttons: [
          {
            text: 'Volver al historial',
            handler: () => {
              volverAlHistorial();
            }
          }
        ]
      });
    } finally {
      setCargando(false);
    }
  }, [id_proyecto, id_incidente, mandarAlerta, volverAlHistorial]);

  useIonViewWillEnter(() => {
    void cargarDetalle();
  });

  const coordenadas = useMemo(
    () => extraerCoordenadasPunto(incidente?.ubicacion ?? null),
    [incidente?.ubicacion]
  );

  const nivelGravedad = Math.min(Math.max(Number(incidente?.nivel_gravedad) || 1, 1), 5);
  const infoGravedad = DESCRIPCIONES_GRAVEDAD[nivelGravedad] || {
    etiqueta: `Nivel ${nivelGravedad}`,
    detalle: ''
  };

  const patrulleroReportante =
    incidente?.nombre_patrullero || incidente?.rut_patrullero || incidente?.rut || null;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="detalle-incidente-grid ion-padding">
          <IonRow>
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="historial"
              />
            </IonCol>

            <IonCol size="12" sizeMd="9" className="detalle-incidente-col">
              {/* Barra superior con botón para regresar */}
              <div className="detalle-incidente-topbar">
                <div className="detalle-topbar-izquierda">
                  <button
                    type="button"
                    className="btn-volver-historial"
                    onClick={volverAlHistorial}
                  >
                    <IonIcon icon={arrowBackOutline} />
                    <span>Volver al historial</span>
                  </button>

                  <div>
                    <h1 className="detalle-incidente-titulo">
                      Detalle del Incidente #{incidente?.id_incidente ?? id_incidente}
                    </h1>
                    <p className="detalle-incidente-subtitulo">
                      Información registrada en terreno y evidencia adjunta
                    </p>
                  </div>
                </div>

                {incidente && (
                  <span className={`badge-gravedad-incidente badge-gravedad-${nivelGravedad}`}>
                    <IonIcon icon={alertCircleOutline} />
                    {infoGravedad.etiqueta}
                  </span>
                )}
              </div>

              {cargando ? (
                <div className="detalle-loading-box">
                  <IonSpinner name="crescent" color="light" />
                  <span>Cargando detalle del incidente...</span>
                </div>
              ) : !incidente ? (
                <div className="detalle-loading-box">
                  <span>No se encontró la información del incidente solicitado.</span>
                </div>
              ) : (
                <>
                  {/* Bloque superior: Información y observaciones + Mapa de ubicación */}
                  <div className="detalle-contenido-principal">
                    <div className="detalle-panel-card">
                      <h2 className="detalle-seccion-titulo">Información general</h2>

                      <div className="detalle-categoria-destacada">
                        <span className="detalle-etiqueta-chica">Categoría del incidente</span>
                        <p className="detalle-valor-grande">{incidente.categoria}</p>
                      </div>

                      <div className="detalle-campos-grid">
                        <div className="detalle-campo-box">
                          <IonIcon icon={calendarOutline} className="detalle-campo-icono" />
                          <div>
                            <span className="detalle-etiqueta-chica">Fecha de registro</span>
                            <p className="detalle-campo-valor">
                              {formatearFecha(incidente.fecha_hora)}
                            </p>
                          </div>
                        </div>

                        <div className="detalle-campo-box">
                          <IonIcon icon={timeOutline} className="detalle-campo-icono" />
                          <div>
                            <span className="detalle-etiqueta-chica">Hora exacta</span>
                            <p className="detalle-campo-valor">
                              {formatearHora(incidente.fecha_hora)}
                            </p>
                          </div>
                        </div>

                        <div className="detalle-campo-box">
                          <IonIcon
                            icon={shieldCheckmarkOutline}
                            className="detalle-campo-icono"
                          />
                          <div>
                            <span className="detalle-etiqueta-chica">Patrullaje asociado</span>
                            <p className="detalle-campo-valor">
                              Patrullaje #{incidente.id_patrullaje}
                            </p>
                          </div>
                        </div>

                        <div className="detalle-campo-box">
                          <IonIcon icon={alertCircleOutline} className="detalle-campo-icono" />
                          <div>
                            <span className="detalle-etiqueta-chica">Evaluación de gravedad</span>
                            <p className="detalle-campo-valor">{infoGravedad.etiqueta}</p>
                          </div>
                        </div>

                        {patrulleroReportante && (
                          <div className="detalle-campo-box">
                            <IonIcon icon={personOutline} className="detalle-campo-icono" />
                            <div>
                              <span className="detalle-etiqueta-chica">Reportado por</span>
                              <p className="detalle-campo-valor">{patrulleroReportante}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="detalle-observaciones-bloque">
                        <span className="detalle-etiqueta-chica">Observaciones del patrullero</span>
                        <p className="detalle-observaciones-parrafo">
                          {incidente.observaciones || 'Sin observaciones registradas.'}
                        </p>
                      </div>
                    </div>

                    {/* Panel derecho: Mapa de ubicación geográfica */}
                    <div className="detalle-panel-card">
                      <h2 className="detalle-seccion-titulo">Ubicación geográfica</h2>

                      <div className="detalle-mapa-contenedor">
                        {coordenadas ? (
                          <>
                            <MapContainer
                              center={coordenadas}
                              zoom={16}
                              className="detalle-mapa-leaflet"
                            >
                              <AjustadorMapaDetalle punto={coordenadas} />
                              <CapaTilesMapa onErrorChange={setErrorMapaBase} />
                              <CircleMarker
                                center={coordenadas}
                                radius={11}
                                pathOptions={{
                                  color: '#ef4444',
                                  fillColor: '#facc15',
                                  fillOpacity: 1,
                                  weight: 3.5
                                }}
                              >
                                <Tooltip direction="top" offset={[0, -8]} permanent>
                                  Incidente #{incidente.id_incidente}
                                </Tooltip>
                              </CircleMarker>
                            </MapContainer>
                            {errorMapaBase && <AvisoErrorMapa />}
                          </>
                        ) : (
                          <div className="detalle-loading-box">
                            <span>Ubicación geográfica no disponible.</span>
                          </div>
                        )}
                      </div>

                      {coordenadas && (
                        <div className="detalle-coords-barra">
                          <span className="detalle-coords-item">
                            <IonIcon icon={locateOutline} />
                            Latitud: {coordenadas[0].toFixed(6)}
                          </span>
                          <span className="detalle-coords-item">
                            Longitud: {coordenadas[1].toFixed(6)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bloque inferior: Galería de fotografías adjuntas */}
                  <div className="detalle-panel-card">
                    <div className="detalle-fotos-header">
                      <h2 className="detalle-seccion-titulo" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                        <IonIcon icon={imagesOutline} style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                        Fotografías adjuntas
                      </h2>
                      <span className="detalle-fotos-contador">
                        {fotos.length} {fotos.length === 1 ? 'fotografía' : 'fotografías'}
                      </span>
                    </div>

                    {fotos.length === 0 ? (
                      <div className="detalle-sin-fotos">
                        Este incidente no cuenta con fotografías adjuntas.
                      </div>
                    ) : (
                      <div className="detalle-galeria-grid">
                        {fotos.map((fotoBase64, idx) => (
                          <button
                            key={`foto-incidente-${idx}`}
                            type="button"
                            className="detalle-foto-item"
                            onClick={() => setIndiceFotoActiva(idx)}
                          >
                            <img
                              src={fotoBase64}
                              alt={`Fotografía ${idx + 1} del incidente #${incidente.id_incidente}`}
                              className="detalle-foto-img"
                            />
                            <span className="detalle-foto-etiqueta">
                              Foto {idx + 1} de {fotos.length}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Visor modal de fotografía a pantalla completa */}
        {indiceFotoActiva !== null && fotos[indiceFotoActiva] && (
          <div
            className="visor-foto-overlay"
            onClick={() => setIndiceFotoActiva(null)}
          >
            <div
              className="visor-foto-barra-superior"
              onClick={(e) => e.stopPropagation()}
            >
              <span>
                Fotografía {indiceFotoActiva + 1} de {fotos.length}
              </span>
              <button
                type="button"
                className="btn-cerrar-visor"
                onClick={() => setIndiceFotoActiva(null)}
              >
                Cerrar
              </button>
            </div>

            <div
              className="visor-foto-marco"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={fotos[indiceFotoActiva]}
                alt={`Vista ampliada ${indiceFotoActiva + 1}`}
                className="visor-foto-img-grande"
              />
            </div>

            {fotos.length > 1 && (
              <div
                className="visor-foto-controles"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn-nav-visor"
                  disabled={indiceFotoActiva === 0}
                  onClick={() => setIndiceFotoActiva((prev) => (prev !== null && prev > 0 ? prev - 1 : prev))}
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="btn-nav-visor"
                  disabled={indiceFotoActiva === fotos.length - 1}
                  onClick={() =>
                    setIndiceFotoActiva((prev) =>
                      prev !== null && prev < fotos.length - 1 ? prev + 1 : prev
                    )
                  }
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default DetalleIncidente;
