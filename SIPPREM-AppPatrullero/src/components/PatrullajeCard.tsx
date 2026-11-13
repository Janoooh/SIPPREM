import React, { useEffect, useMemo, useState } from 'react';
import {
  IonCard,
  IonCardContent,
  IonButton,
  useIonRouter
} from '@ionic/react';
import L from 'leaflet';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import { MAP_TILE_URL } from '../config/env';
import './PatrullajeCard.css';

const QUINCE_MINUTOS_MS = 15 * 60 * 1000;

export type PuntoMapa = [number, number];

export const convertirGeoJSONAPuntos = (geoJson: any): PuntoMapa[] => {
  if (!geoJson) return [];

  try {
    const objetoGeo = typeof geoJson === 'string' ? JSON.parse(geoJson) : geoJson;
    if (
      objetoGeo?.type === 'Polygon' &&
      Array.isArray(objetoGeo.coordinates) &&
      Array.isArray(objetoGeo.coordinates[0])
    ) {
      const anillo: [number, number][] = objetoGeo.coordinates[0];
      // En GeoJSON el último punto repite el primero para cerrar el anillo; lo quitamos de la lista de vértices
      const verticesSinCierre =
        anillo.length > 3 &&
        anillo[0][0] === anillo[anillo.length - 1][0] &&
        anillo[0][1] === anillo[anillo.length - 1][1]
          ? anillo.slice(0, -1)
          : anillo;

      // Invertimos [longitud, latitud] de GeoJSON a [latitud, longitud] para Leaflet
      return verticesSinCierre
        .map(([lng, lat]): PuntoMapa => [Number(lat), Number(lng)])
        .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
    }
  } catch (error) {
    console.error('Error al convertir GeoJSON a puntos:', error);
  }

  return [];
};

export const AjustadorMapa: React.FC<{
  puntos: PuntoMapa[];
  padding?: [number, number];
}> = ({ puntos, padding = [8, 8] }) => {
  const map = useMap();

  useEffect(() => {
    const ajustarVista = () => {
      map.invalidateSize();
      if (puntos.length >= 3) {
        const bounds = L.latLngBounds(puntos);
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding, animate: false });
        }
      }
    };

    ajustarVista();
    // Reajusta tras animaciones iniciales de Ionic para evitar áreas sin tiles en tarjetas
    const t1 = setTimeout(ajustarVista, 150);
    const t2 = setTimeout(ajustarVista, 450);

    const resizeObserver = new ResizeObserver(ajustarVista);
    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
    };
  }, [map, puntos, padding[0], padding[1]]);

  return null;
};

const formatearFecha = (fechaIso: string): string => {
  if (!fechaIso) return '--/--/----';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return '--/--/----';
  const dia = String(fecha.getDate()).padStart(2, '0');
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const anio = fecha.getFullYear();
  return `${dia}/${mes}/${anio}`;
};

export const formatearHora = (fechaIso: string): string => {
  if (!fechaIso) return '--:--';
  const fecha = new Date(fechaIso);
  return !Number.isNaN(fecha.getTime())
    ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    : '--:--';
};

interface PatrullajeCardProps {
  patrullaje: PatrullajeUsuario;
}

const PatrullajeCard: React.FC<PatrullajeCardProps> = ({ patrullaje }) => {
  const router = useIonRouter();
  const [ahoraMs, setAhoraMs] = useState<number>(() => Date.now());

  const puntosZona = useMemo(
    () => convertirGeoJSONAPuntos(patrullaje.zona),
    [patrullaje.zona]
  );

  const estadoNormalizado = (patrullaje.estado || '').trim().toLowerCase();
  const claseEstado = estadoNormalizado.replace(/\s+/g, '-');
  const esFinalizado = estadoNormalizado === 'finalizado';
  const esEnCurso = estadoNormalizado === 'en curso';

  const inicioMs = useMemo(() => {
    if (!patrullaje.hora_inicio) return Number.NaN;
    return new Date(patrullaje.hora_inicio).getTime();
  }, [patrullaje.hora_inicio]);

  const terminoMs = useMemo(() => {
    if (!patrullaje.hora_termino) return Number.NaN;
    return new Date(patrullaje.hora_termino).getTime();
  }, [patrullaje.hora_termino]);

  const estaVencidoPlanificado =
    !esFinalizado && !esEnCurso && !Number.isNaN(terminoMs) && ahoraMs > terminoMs;

  const dentroVentanaInicio =
    !Number.isNaN(inicioMs) &&
    inicioMs - ahoraMs <= QUINCE_MINUTOS_MS &&
    !estaVencidoPlanificado;

  const botonHabilitado = esEnCurso || dentroVentanaInicio;
  const textoBoton = esEnCurso ? 'Gestionar patrullaje' : 'Iniciar patrullaje';

  useEffect(() => {
    if (esFinalizado || esEnCurso || dentroVentanaInicio || Number.isNaN(inicioMs)) {
      return;
    }

    const msHastaVentana = inicioMs - QUINCE_MINUTOS_MS - Date.now();
    if (msHastaVentana <= 0) {
      setAhoraMs(Date.now());
      return;
    }

    const espera = Math.min(msHastaVentana, 30000);
    const timer = setTimeout(() => {
      setAhoraMs(Date.now());
    }, espera);

    return () => clearTimeout(timer);
  }, [ahoraMs, esFinalizado, esEnCurso, dentroVentanaInicio, inicioMs]);

  return (
    <IonCard className="patrullaje-card-item">
      <IonCardContent className="card-content-flex">
        <div className="mapa-container">
          {puntosZona.length >= 3 ? (
            <MapContainer
              center={puntosZona[0]}
              zoom={15}
              className="mapa-leaflet"
              zoomControl={false}
              attributionControl={false}
              dragging={false}
              touchZoom={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              boxZoom={false}
              keyboard={false}
            >
              <AjustadorMapa puntos={puntosZona} />
              <TileLayer
                url={MAP_TILE_URL}
                attribution="&copy; OpenStreetMap contributors"
              />
              <Polygon
                positions={puntosZona}
                interactive={false}
                pathOptions={{
                  color: '#0284c7',
                  fillColor: '#38bdf8',
                  fillOpacity: 0.4,
                  weight: 2
                }}
              />
            </MapContainer>
          ) : (
            <div className="mapa-sin-zona">Sin zona</div>
          )}
        </div>

        <div className="info-patrullaje">
          <p className="proyecto-nombre">
            <strong>Proyecto:</strong> {patrullaje.nombre_proyecto}
          </p>
          <p>
            <strong>Fecha:</strong> {formatearFecha(patrullaje.hora_inicio)}
          </p>
          <p>
            <strong>Inicio:</strong> {formatearHora(patrullaje.hora_inicio)}
          </p>
          <p>
            <strong>Término:</strong> {formatearHora(patrullaje.hora_termino)}
          </p>

          {/* Estado con etiqueta*/}
          <p className="estado-container">
            <strong>Estado:</strong>
            <span className={`badge-estado ${claseEstado}`}>
              {patrullaje.estado}
            </span>
          </p>
        </div>
      </IonCardContent>

      {/* Botón de acción rápido si está planificado o en curso */}
      {!esFinalizado && (
        <div className="ion-padding-horizontal ion-padding-bottom">
          <IonButton
            expand="block"
            shape="round"
            size="small"
            className="btn-iniciar-item"
            disabled={!botonHabilitado}
            onClick={() => {
              if (!botonHabilitado) return;
              const rutaDestino = esEnCurso
                ? `/patrullero/proyecto/${patrullaje.id_proyecto}/patrullaje-activo?id_patrullaje=${patrullaje.id_patrullaje}`
                : `/patrullero/proyecto/${patrullaje.id_proyecto}/preparacion?id_patrullaje=${patrullaje.id_patrullaje}`;
              router.push(rutaDestino, 'forward');
            }}
          >
            {textoBoton}
          </IonButton>
        </div>
      )}
    </IonCard>
  );
};

export default PatrullajeCard;
