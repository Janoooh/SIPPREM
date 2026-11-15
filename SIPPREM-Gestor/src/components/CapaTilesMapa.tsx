import React, { useMemo, useRef } from 'react';
import { TileLayer } from 'react-leaflet';
import { MAP_TILE_URL } from '../config/env';

interface CapaTilesMapaProps {
  /* Notifica cuando el proveedor de mosaicos entra o sale de estado de error. */
  onErrorChange?: (hayError: boolean) => void;
}

/*Envuelve el TileLayer base configurado por entorno y gestiona errores de carga.*/
export const CapaTilesMapa: React.FC<CapaTilesMapaProps> = ({ onErrorChange }) => {
  const hayErrorRef = useRef(false);

  const eventHandlers = useMemo(
    () => ({
      tileerror: () => {
        if (!hayErrorRef.current) {
          hayErrorRef.current = true;
          console.warn(
            'No se pudieron cargar los mosaicos del mapa base desde el proveedor configurado.'
          );
          onErrorChange?.(true);
        }
      },
      tileload: () => {
        if (hayErrorRef.current) {
          hayErrorRef.current = false;
          onErrorChange?.(false);
        }
      }
    }),
    [onErrorChange]
  );

  return (
    <TileLayer
      url={MAP_TILE_URL}
      attribution="&copy; OpenStreetMap contributors"
      eventHandlers={eventHandlers}
    />
  );
};
