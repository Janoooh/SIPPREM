// Coordenadas obtenidas desde el GPS/navegador del dispositivo
export interface CoordenadasDispositivo {
  latitud: number;
  longitud: number;
  precision?: number | null;
}

// Payload esperado por el evento "unirseProyecto" en el backend
export interface PayloadUnirseProyecto {
  id_proyecto: number;
}

// Payload esperado por el evento "enviarUbicacion" en el backend
export interface PayloadUbicacionPatrullaje {
  id_proyecto: number;
  id_patrullaje: number | null;
  id_vehiculo: string | null;
  hora_inicio: string | null;
  hora_termino: string | null;
  latitud: number;
  longitud: number;
}

// Payload esperado por el evento "botonDePanico" en el backend
export interface PayloadBotonPanico {
  id_proyecto: number;
  latitud: number;
  longitud: number;
}

// Formato estándar de respuesta emitida por el servidor Socket.IO
export interface RespuestaSocket<T = unknown> {
  ok: boolean;
  message: string;
  data: T;
}
