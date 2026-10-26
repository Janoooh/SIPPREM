import React, { useState, useEffect } from 'react';
import { IonButton, IonIcon, IonText } from '@ionic/react';
import { arrowUndoOutline } from 'ionicons/icons';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  CircleMarker,
  useMap,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './mapaPoligono.css';

// Tipo que representa una coordenada geográfica [latitud, longitud]
export type PuntoMapa = [number, number];

export interface MapaPoligonoProps {
  /** Lista de puntos controlada desde el componente padre (opcional) */
  puntos?: PuntoMapa[];
  /**
   * Callback que se ejecuta cada vez que se agrega o elimina un vértice.
   * Entrega tanto el arreglo de puntos [lat, lng] como el string WKT POLYGON((...)) para el backend.
   */
  onChangePuntos?: (puntos: PuntoMapa[], zonaWKT: string) => void;
  /** Coordenadas iniciales para centrar el mapa (por defecto Valparaíso) */
  centroInicial?: PuntoMapa;
  /** Nivel de zoom inicial del mapa */
  zoomInicial?: number;
  /** Altura del contenedor del mapa */
  altura?: string;
  /** Si es true, bloquea la edición del polígono (modo solo lectura) */
  soloLectura?: boolean;
}

/**
 * Función utilitaria que transforma la lista de vértices [latitud, longitud]
 * al formato WKT requerido por PostGIS y el validador del backend:
 * "POLYGON((lng1 lat1, lng2 lat2, lng3 lat3, lng1 lat1))"
 * Cierra automáticamente el polígono repitiendo el primer punto al final.
 */
export const convertirPuntosAPoligonoWKT = (puntos: PuntoMapa[]): string => {
  // Un polígono requiere como mínimo 3 vértices distintos
  if (!puntos || puntos.length < 3) {
    return '';
  }

  // En PostGIS (SRID 4326), el orden de cada par es: LONGITUD LATITUD
  const coordenadasTexto = puntos.map(([lat, lng]) => `${lng} ${lat}`);

  // Cerramos el polígono agregando nuevamente el primer vértice al final
  const [primerLat, primerLng] = puntos[0];
  coordenadasTexto.push(`${primerLng} ${primerLat}`);

  return `POLYGON((${coordenadasTexto.join(', ')}))`;
};

/**
 * Función utilitaria para convertir un objeto GeoJSON Polygon proveniente del backend
 * (ST_AsGeoJSON) a una lista de vértices [latitud, longitud] para el componente MapaPoligono.
 */
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
      return verticesSinCierre.map(([lng, lat]) => [Number(lat), Number(lng)]);
    }
  } catch (error) {
    console.error('Error al convertir GeoJSON a puntos:', error);
  }

  return [];
};

/**
 * Subcomponente encargado de recalcular el tamaño del mapa de Leaflet
 * cuando se monta o cambia las dimensiones de la vista en Ionic.
 */
const MapResizer: React.FC<{ puntos?: PuntoMapa[] }> = ({ puntos }) => {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 300);
    const t3 = setTimeout(() => map.invalidateSize(), 700);
    const t4 = setTimeout(() => map.invalidateSize(), 1500);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });

    const container = map.getContainer();
    if (container) {
      resizeObserver.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      resizeObserver.disconnect();
    };
  }, [map]);

  // Si se cargan puntos iniciales (por ejemplo al modificar un proyecto), centra el mapa en el primer vértice
  useEffect(() => {
    if (puntos && puntos.length > 0) {
      map.setView(puntos[0], map.getZoom());
    }
  }, [puntos, map]);

  return null;
};

/**
 * Subcomponente que escucha los clicks sobre el mapa y agrega cada click
 * como un nuevo vértice del polígono (solo cuando no está en modo soloLectura).
 */
const CapturadorClicksMapa: React.FC<{
  onAgregarPunto: (nuevoPunto: PuntoMapa) => void;
  soloLectura: boolean;
}> = ({ onAgregarPunto, soloLectura }) => {
  useMapEvents({
    click(evento) {
      if (soloLectura) return;
      const nuevoVertice: PuntoMapa = [evento.latlng.lat, evento.latlng.lng];
      onAgregarPunto(nuevoVertice);
    }
  });

  return null;
};

/**
 * Componente MapaPoligono:
 * Muestra un mapa interactivo con un botón lateral de flecha "volver/deshacer".
 * Cada click en el mapa añade un vértice al polígono y lo guarda en una lista de puntos
 * lista para enviarse al backend como zona del proyecto.
 */
const MapaPoligono: React.FC<MapaPoligonoProps> = ({
  puntos,
  onChangePuntos,
  centroInicial = [-33.0456, -71.6203],
  zoomInicial = 13,
  altura = '350px',
  soloLectura = false
}) => {
  // Estado interno de la lista de puntos (se sincroniza si el padre pasa la prop `puntos`)
  const [listaPuntos, setListaPuntos] = useState<PuntoMapa[]>(puntos || []);

  useEffect(() => {
    if (puntos !== undefined) {
      setListaPuntos(puntos);
    }
  }, [puntos]);

  // Función interna para actualizar la lista de vértices y notificar al componente padre
  const actualizarListaPuntos = (nuevosPuntos: PuntoMapa[]) => {
    setListaPuntos(nuevosPuntos);
    if (onChangePuntos) {
      const zonaWKT = convertirPuntosAPoligonoWKT(nuevosPuntos);
      onChangePuntos(nuevosPuntos, zonaWKT);
    }
  };

  // Agrega un nuevo punto al hacer click en el mapa
  const handleAgregarPunto = (nuevoPunto: PuntoMapa) => {
    if (soloLectura) return;
    const nuevosPuntos = [...listaPuntos, nuevoPunto];
    actualizarListaPuntos(nuevosPuntos);
  };

  // Elimina el último punto agregado al presionar el botón con la flecha de volver
  const handleDeshacerUltimoPunto = () => {
    if (soloLectura || listaPuntos.length === 0) return;
    const nuevosPuntos = listaPuntos.slice(0, -1);
    actualizarListaPuntos(nuevosPuntos);
  };

  return (
    <div>
      <div className="mapa-poligono-wrapper">
        {/* Lienzo del mapa interactivo */}
        <div className="mapa-poligono-lienzo" style={soloLectura ? { opacity: 0.85 } : undefined}>
          <MapContainer
            center={centroInicial}
            zoom={zoomInicial}
            style={{ height: altura, width: '100%', zIndex: 1 }}
          >
            <MapResizer puntos={soloLectura ? listaPuntos : undefined} />
            <CapturadorClicksMapa onAgregarPunto={handleAgregarPunto} soloLectura={soloLectura} />

            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* Dibuja cada vértice marcado en el mapa */}
            {listaPuntos.map((punto, index) => (
              <CircleMarker
                key={`vertice-${index}-${punto[0]}-${punto[1]}`}
                center={punto}
                radius={6}
                pathOptions={{
                  color: '#121c27',
                  fillColor: index === 0 ? '#38bdf8' : '#48D1E6',
                  fillOpacity: 1,
                  weight: 2
                }}
              />
            ))}

            {/* Si hay exactamente 2 puntos, dibuja una línea entre ellos */}
            {listaPuntos.length === 2 && (
              <Polyline
                positions={listaPuntos}
                pathOptions={{ color: '#48D1E6', weight: 3 }}
              />
            )}

            {/* Si hay 3 o más puntos, dibuja el polígono cerrado */}
            {listaPuntos.length >= 3 && (
              <Polygon
                positions={listaPuntos}
                pathOptions={{
                  color: '#48D1E6',
                  fillColor: '#48D1E6',
                  fillOpacity: 0.35,
                  weight: 3
                }}
              />
            )}
          </MapContainer>
        </div>

        {/* Botón al lado del mapa con flecha tipo volver para deshacer el último punto */}
        <div className="mapa-poligono-acciones">
          <IonButton
            className="btn-deshacer-punto"
            onClick={handleDeshacerUltimoPunto}
            disabled={soloLectura || listaPuntos.length === 0}
            title={soloLectura ? 'Zona bloqueada en modo modificación' : 'Deshacer último punto'}
          >
            <IonIcon slot="icon-only" icon={arrowUndoOutline} />
          </IonButton>
        </div>
      </div>

      {/* Indicador de ayuda para el usuario */}
      <IonText className="mapa-poligono-info">
        <p>
          {soloLectura ? (
            'Área del proyecto (bloqueada para modificación)'
          ) : (
            <>
              Vértices marcados: <strong>{listaPuntos.length}</strong>{' '}
              {listaPuntos.length < 3
                ? '(mínimo 3 puntos para formar el polígono)'
                : '(polígono válido)'}
            </>
          )}
        </p>
      </IonText>
    </div>
  );
};

export default MapaPoligono;
