import React, { useMemo } from 'react';
import { IonLabel } from '@ionic/react';
import { TrabajadorProyecto } from '../services/trabajadoresService';
import './FormularioPatrullaje.css';

export interface FormularioPatrullajeProps {
  /** Lista de trabajadores con rol Patrullero pertenecientes al proyecto */
  patrullerosDisponibles: TrabajadorProyecto[];
  /** RUT del patrullero seleccionado como encargado */
  encargadoRut: string;
  setEncargadoRut: (rut: string) => void;
  /** RUT del patrullero seleccionado como acompañante (opcional) */
  acompananteRut: string;
  setAcompananteRut: (rut: string) => void;
  /** Hora de inicio en formato HH:MM */
  horaInicio: string;
  setHoraInicio: (hora: string) => void;
  /** Hora de término en formato HH:MM */
  horaTermino: string;
  setHoraTermino: (hora: string) => void;
}

// Opciones de horas de 00 a 23 en formato 24 horas
const HORAS_OPCIONES = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

// Opciones de minutos en intervalos regulares de 5 minutos
const MINUTOS_OPCIONES = [
  '00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'
];

const FormularioPatrullaje: React.FC<FormularioPatrullajeProps> = ({
  patrullerosDisponibles,
  encargadoRut,
  setEncargadoRut,
  acompananteRut,
  setAcompananteRut,
  horaInicio,
  setHoraInicio,
  horaTermino,
  setHoraTermino
}) => {
  // Descomponer horaInicio y horaTermino en hora y minuto
  const [horaInicioH, horaInicioM] = useMemo(() => {
    const partes = (horaInicio || '08:00').split(':');
    return [partes[0] || '08', partes[1] || '00'];
  }, [horaInicio]);

  const [horaTerminoH, horaTerminoM] = useMemo(() => {
    const partes = (horaTermino || '16:00').split(':');
    return [partes[0] || '16', partes[1] || '00'];
  }, [horaTermino]);

  // Actualizar hora de inicio
  const handleCambiarInicio = (nuevaH: string, nuevoM: string) => {
    setHoraInicio(`${nuevaH}:${nuevoM}`);
  };

  // Actualizar hora de término
  const handleCambiarTermino = (nuevaH: string, nuevoM: string) => {
    setHoraTermino(`${nuevaH}:${nuevoM}`);
  };

  // Aplicar un turno sugerido con un solo clic
  const aplicarTurno = (ini: string, fin: string) => {
    setHoraInicio(ini);
    setHoraTermino(fin);
  };

  // Cálculo de la duración del patrullaje con soporte para turnos que cruzan medianoche
  const textoDuracion = useMemo(() => {
    const minInicio = Number(horaInicioH) * 60 + Number(horaInicioM);
    let minTermino = Number(horaTerminoH) * 60 + Number(horaTerminoM);

    if (minTermino <= minInicio) {
      // Cruza la medianoche (termina al día siguiente)
      minTermino += 24 * 60;
    }

    const diff = minTermino - minInicio;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;

    let resultado = `${hrs} hr${hrs !== 1 ? 's' : ''}`;
    if (mins > 0) {
      resultado += ` ${mins} min`;
    }

    if (Number(horaTerminoH) * 60 + Number(horaTerminoM) <= Number(horaInicioH) * 60 + Number(horaInicioM)) {
      resultado += ' (día sig.)';
    }

    return resultado;
  }, [horaInicioH, horaInicioM, horaTerminoH, horaTerminoM]);

  // Si se selecciona el mismo encargado como acompañante, se limpia el acompañante
  const handleChangeEncargado = (nuevoRut: string) => {
    setEncargadoRut(nuevoRut);
    if (nuevoRut && nuevoRut === acompananteRut) {
      setAcompananteRut('');
    }
  };

  return (
    <div className="formulario-patrullaje-container">
      {/* Selector desplegable para el Encargado de patrullaje */}
      <div className="campo-grupo-patrullaje">
        <IonLabel className="label-patrullaje">Encargado de patrullaje</IonLabel>
        <select
          className="select-patrullero"
          value={encargadoRut}
          onChange={(e) => handleChangeEncargado(e.target.value)}
        >
          <option value="">Patrulleros (Seleccione encargado)</option>
          {patrullerosDisponibles.map((p) => (
            <option key={`enc-${p.rut}`} value={p.rut}>
              {p.nombre} ({p.rut})
            </option>
          ))}
        </select>
      </div>

      {/* Selector desplegable para el Acompañante */}
      <div className="campo-grupo-patrullaje">
        <IonLabel className="label-patrullaje">Acompañante</IonLabel>
        <select
          className="select-patrullero"
          value={acompananteRut}
          onChange={(e) => setAcompananteRut(e.target.value)}
        >
          <option value="">Patrulleros (Sin acompañante)</option>
          {patrullerosDisponibles
            .filter((p) => p.rut !== encargadoRut)
            .map((p) => (
              <option key={`acom-${p.rut}`} value={p.rut}>
                {p.nombre} ({p.rut})
              </option>
            ))}
        </select>
      </div>

      {/* Bloque de selección de horario optimizado */}
      <div className="bloque-tiempo-patrullaje">
        <div className="fila-tiempo-header">
          <span className="label-patrullaje">Horario del patrullaje</span>
          <span className="badge-duracion">Duración: {textoDuracion}</span>
        </div>

        <div className="tiempo-controles-grid">
          {/* Hora de inicio */}
          <div className="control-tiempo-item">
            <span className="sublabel-tiempo">Hora Inicio</span>
            <div className="selects-tiempo-grupo">
              <select
                className="select-tiempo-unidad"
                value={horaInicioH}
                onChange={(e) => handleCambiarInicio(e.target.value, horaInicioM)}
                title="Hora de inicio"
              >
                {HORAS_OPCIONES.map((h) => (
                  <option key={`ini-h-${h}`} value={h}>
                    {h} hrs
                  </option>
                ))}
              </select>
              <span className="dos-puntos">:</span>
              <select
                className="select-tiempo-unidad"
                value={horaInicioM}
                onChange={(e) => handleCambiarInicio(horaInicioH, e.target.value)}
                title="Minutos de inicio"
              >
                {MINUTOS_OPCIONES.map((m) => (
                  <option key={`ini-m-${m}`} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>

          <span className="separador-flecha">➜</span>

          {/* Hora de término */}
          <div className="control-tiempo-item">
            <span className="sublabel-tiempo">Hora Término</span>
            <div className="selects-tiempo-grupo">
              <select
                className="select-tiempo-unidad"
                value={horaTerminoH}
                onChange={(e) => handleCambiarTermino(e.target.value, horaTerminoM)}
                title="Hora de término"
              >
                {HORAS_OPCIONES.map((h) => (
                  <option key={`fin-h-${h}`} value={h}>
                    {h} hrs
                  </option>
                ))}
              </select>
              <span className="dos-puntos">:</span>
              <select
                className="select-tiempo-unidad"
                value={horaTerminoM}
                onChange={(e) => handleCambiarTermino(horaTerminoH, e.target.value)}
                title="Minutos de término"
              >
                {MINUTOS_OPCIONES.map((m) => (
                  <option key={`fin-m-${m}`} value={m}>
                    {m} min
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botones de turnos rápidos sugeridos */}
        <div className="turnos-rapidos-container">
          <span className="turnos-rapidos-label">Turnos sugeridos:</span>
          <div className="chips-turnos">
            <button
              type="button"
              className={`chip-turno ${
                horaInicio === '08:00' && horaTermino === '16:00' ? 'chip-activo' : ''
              }`}
              onClick={() => aplicarTurno('08:00', '16:00')}
            >
              Mañana (08:00 - 16:00)
            </button>
            <button
              type="button"
              className={`chip-turno ${
                horaInicio === '16:00' && horaTermino === '00:00' ? 'chip-activo' : ''
              }`}
              onClick={() => aplicarTurno('16:00', '00:00')}
            >
              Tarde (16:00 - 00:00)
            </button>
            <button
              type="button"
              className={`chip-turno ${
                horaInicio === '00:00' && horaTermino === '08:00' ? 'chip-activo' : ''
              }`}
              onClick={() => aplicarTurno('00:00', '08:00')}
            >
              Noche (00:00 - 08:00)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormularioPatrullaje;
