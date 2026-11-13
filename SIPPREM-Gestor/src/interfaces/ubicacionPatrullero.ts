// Datos retransmitidos por el backend en el evento "ubicacionPatrullero"
export interface UbicacionPatrulleroData {
  rut: string;
  nombre: string;
  id_proyecto: number;
  id_patrullaje: number | null;
  id_vehiculo: string | null;
  hora_inicio: string | null;
  hora_termino: string | null;
  latitud: number;
  longitud: number;
  fecha_actualizacion: string;
}

// Datos emitidos por el backend en el evento global "alertaPanico"
export interface AlertaPanicoData {
  rut: string;
  nombre: string;
  id_proyecto: number;
  latitud: number;
  longitud: number;
  fecha_hora: string;
}

// Alerta de pánico enriquecida para mostrar en la cola del modal global
export interface AlertaPanicoRecibida extends AlertaPanicoData {
  idAlerta: string;
  nombreProyecto: string;
}

// Payload para solicitar el ingreso a la sala del proyecto vía WebSocket
export interface PayloadUnirseProyecto {
  id_proyecto: number;
}

// Payload devuelto por el backend en el evento "unidoAProyecto"
export interface UnidoAProyectoData {
  id_proyecto: number;
  sala: string;
}

// Formato estándar de respuestas y eventos emitidos por Socket.IO en el backend
export interface RespuestaSocket<T = unknown> {
  ok: boolean;
  message: string;
  data: T;
}
