import React, { useEffect, useMemo, useState } from 'react';
import { IonIcon } from '@ionic/react';
import {
  alertCircleOutline,
  calendarOutline,
  locateOutline,
  personOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';
import { CircleMarker, MapContainer, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { IncidenteProyecto } from '../services/incidentesService';
import { CapaTilesMapa } from './CapaTilesMapa';
import { AvisoErrorMapa } from './AvisoErrorMapa';
import './IncidentesCard.css';

const ETIQUETAS_GRAVEDAD: Record<number, string> = {
  1: 'Nivel 1 - Muy baja',
  2: 'Nivel 2 - Baja',
  3: 'Nivel 3 - Media',
  4: 'Nivel 4 - Alta',
  5: 'Nivel 5 - Crítica'
};

// Extrae [latitud, longitud] desde un objeto GeoJSON Point devuelto por PostGIS
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

const formatearFechaHora = (fechaIso: string): string => {
  if (!fechaIso) return 'Fecha no disponible';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'Fecha no disponible';

  const fechaStr = fecha.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaStr = fecha.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  return `${fechaStr} - ${horaStr} hrs`;
};

const AjustadorPuntoMapa: React.FC<{ punto: [number, number] }> = ({ punto }) => {
  const map = useMap();

  useEffect(() => {
    const reajustar = () => {
      map.invalidateSize();
      map.setView(punto, 16, { animate: false });
    };

    reajustar();
    const t1 = setTimeout(reajustar, 150);
    const t2 = setTimeout(reajustar, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, punto]);

  return null;
};

export interface IncidentesCardProps {
  incidente: IncidenteProyecto;
}

const IncidentesCard: React.FC<IncidentesCardProps> = ({ incidente }) => {
  const [errorMapaBase, setErrorMapaBase] = useState<boolean>(false);

  const coordenadas = useMemo(
    () => extraerCoordenadasPunto(incidente.ubicacion),
    [incidente.ubicacion]
  );

  const nivel = Math.min(Math.max(Number(incidente.nivel_gravedad) || 1, 1), 5);
  const textoGravedad = ETIQUETAS_GRAVEDAD[nivel] || `Nivel ${nivel}`;
  const patrulleroReportante =
    incidente.nombre_patrullero || incidente.rut_patrullero || incidente.rut || null;

  return (
    <article className="incidente-card">
      {/* Encabezado: Categoría + Nivel de gravedad */}
      <div className="incidente-card-header">
        <div className="incidente-titulo-bloque">
          <span className="incidente-id-tag">Incidente #{incidente.id_incidente}</span>
          <h3 className="incidente-categoria-titulo">{incidente.categoria}</h3>
        </div>

        <span className={`badge-gravedad-incidente badge-gravedad-${nivel}`}>
          <IonIcon icon={alertCircleOutline} />
          {textoGravedad}
        </span>
      </div>

      {/* Cuerpo: Metadatos y Observaciones a la izquierda + Mapa Leaflet a la derecha */}
      <div className="incidente-card-body">
        <div className="incidente-info-col">
          <div className="incidente-metadatos-lista">
            <span className="incidente-meta-item">
              <IonIcon icon={calendarOutline} className="incidente-meta-icono" />
              <span>{formatearFechaHora(incidente.fecha_hora)}</span>
            </span>

            <span className="incidente-meta-item">
              <IonIcon icon={shieldCheckmarkOutline} className="incidente-meta-icono" />
              <span>Patrullaje #{incidente.id_patrullaje}</span>
            </span>

            {patrulleroReportante && (
              <span className="incidente-meta-item">
                <IonIcon icon={personOutline} className="incidente-meta-icono" />
                <span>Reportado por: {patrulleroReportante}</span>
              </span>
            )}
          </div>

          <div className="incidente-observaciones-caja">
            <span className="incidente-observaciones-label">Observaciones</span>
            <p className="incidente-observaciones-texto">
              {incidente.observaciones || 'Sin observaciones adicionales.'}
            </p>
          </div>
        </div>

        <div className="incidente-mapa-col">
          <div className="incidente-mapa-wrapper">
            {coordenadas ? (
              <>
                <MapContainer
                  center={coordenadas}
                  zoom={16}
                  className="incidente-mapa-leaflet"
                  zoomControl={false}
                  attributionControl={false}
                  scrollWheelZoom={false}
                >
                  <AjustadorPuntoMapa punto={coordenadas} />
                  <CapaTilesMapa onErrorChange={setErrorMapaBase} />
                  <CircleMarker
                    center={coordenadas}
                    radius={9}
                    pathOptions={{
                      color: '#ef4444',
                      fillColor: '#facc15',
                      fillOpacity: 1,
                      weight: 3
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -6]}>
                      {incidente.categoria}
                    </Tooltip>
                  </CircleMarker>
                </MapContainer>
                {errorMapaBase && <AvisoErrorMapa />}
              </>
            ) : (
              <div className="incidente-sin-ubicacion">Ubicación no disponible</div>
            )}
          </div>

          {coordenadas && (
            <span className="incidente-coords-pie">
              <IonIcon icon={locateOutline} />
              <span>
                {coordenadas[0].toFixed(5)}, {coordenadas[1].toFixed(5)}
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default IncidentesCard;
