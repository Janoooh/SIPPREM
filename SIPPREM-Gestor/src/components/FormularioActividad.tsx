import React, { useState, useEffect } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLabel,
  IonInput,
  IonTextarea,
  IonButton,
  IonIcon,
  useIonAlert
} from '@ionic/react';
import { calendarOutline } from 'ionicons/icons';
import { ActividadFutura } from '../interfaces/actividadFutura';
import { ActividadPayload } from '../interfaces/actividadPayload';
import './FormularioActividad.css';

export interface FormularioActividadProps {
  /** Datos previos de la actividad cuando se usa en modo modificación. */
  actividadInicial?: ActividadFutura;
  /** Fecha preseleccionada desde el calendario en formato YYYY-MM-DD. */
  fechaInicial?: string;
  /** Modo de uso del formulario. */
  modo?: 'agregar' | 'modificar';
  /** Callback ejecutado tras validar todos los campos. */
  onSubmit: (datos: ActividadPayload) => void | Promise<void>;
  /** Callback opcional para volver al cronograma sin guardar. */
  onCancel?: () => void;
  /** Indica si hay una petición en curso para evitar envíos duplicados. */
  cargando?: boolean;
}

/** Normaliza una fecha ISO o Date a formato YYYY-MM-DD requerido por IonInput type="date". */
const normalizarFecha = (valor?: string | Date): string => {
  if (!valor) {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof valor === 'string') {
    const parteFecha = valor.split('T')[0].split(' ')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(parteFecha)) {
      return parteFecha;
    }
  }
  const fechaObj = new Date(valor);
  if (isNaN(fechaObj.getTime())) return '';
  const y = fechaObj.getFullYear();
  const m = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const d = String(fechaObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const FormularioActividad: React.FC<FormularioActividadProps> = ({
  actividadInicial,
  fechaInicial,
  modo = 'agregar',
  onSubmit,
  onCancel,
  cargando = false
}) => {
  const [mandarAlerta] = useIonAlert();
  const esModificar = modo === 'modificar';

  const [titulo, setTitulo] = useState<string>('');
  const [fecha, setFecha] = useState<string>(() => normalizarFecha(fechaInicial));
  const [descripcion, setDescripcion] = useState<string>('');

  // Sincroniza los campos cuando llega una actividad existente para editar
  useEffect(() => {
    if (actividadInicial) {
      setTitulo(actividadInicial.titulo || actividadInicial.tipoActividad || '');
      setFecha(normalizarFecha(actividadInicial.fecha || actividadInicial.fechaHoraInicio));
      setDescripcion(actividadInicial.descripcion || '');
    } else if (fechaInicial) {
      setFecha(normalizarFecha(fechaInicial));
    }
  }, [actividadInicial, fechaInicial]);

  const handleSubmit = () => {
    const tituloLimpio = titulo.trim();
    const descripcionLimpia = descripcion.trim();

    if (!tituloLimpio) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe ingresar un título para la actividad.',
        buttons: ['Aceptar']
      });
      return;
    }

    if (tituloLimpio.length > 100) {
      mandarAlerta({
        header: 'Longitud excedida',
        message: 'El título de la actividad no puede superar los 100 caracteres.',
        buttons: ['Aceptar']
      });
      return;
    }

    if (!fecha) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe seleccionar la fecha de la actividad.',
        buttons: ['Aceptar']
      });
      return;
    }

    if (!descripcionLimpia) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe ingresar una descripción para la actividad.',
        buttons: ['Aceptar']
      });
      return;
    }

    if (descripcionLimpia.length > 255) {
      mandarAlerta({
        header: 'Longitud excedida',
        message: 'La descripción no puede superar los 255 caracteres.',
        buttons: ['Aceptar']
      });
      return;
    }

    onSubmit({
      titulo: tituloLimpio,
      fecha,
      descripcion: descripcionLimpia
    });
  };

  const formularioIncompleto = !titulo.trim() || !fecha || !descripcion.trim() || cargando;

  return (
    <IonGrid className="formulario-actividad-grid">
      <IonRow className="actividad-form-header-row">
        <IonCol size="12" sizeSm="auto" className="ion-no-padding">
          <IonText className="actividad-form-titulo">
            {esModificar ? 'Modificar actividad' : 'Registrar actividad'}
          </IonText>
        </IonCol>
      </IonRow>

      <IonRow>
        <IonCol size="12" className="ion-no-padding">
          {/* Título de la actividad (RF04 - varchar(100)) */}
          <IonLabel className="actividad-form-label">
            Título de la actividad
            <IonText className="actividad-asterisco"> (*)</IonText>
          </IonLabel>
          <IonInput
            className="actividad-form-input"
            value={titulo}
            maxlength={100}
            placeholder="Ej. Reunión de coordinación operativa"
            onIonInput={(e) => setTitulo(e.detail.value || '')}
            clearInput={true}
          />
          <IonText className="actividad-contador-texto">
            {titulo.length}/100 caracteres
          </IonText>

          {/* Fecha de la actividad */}
          <IonLabel className="actividad-form-label">
            Fecha de la actividad
            <IonText className="actividad-asterisco"> (*)</IonText>
          </IonLabel>
          <IonInput
            type="date"
            className="actividad-form-input actividad-fecha-input"
            value={fecha}
            onIonInput={(e) => setFecha(e.detail.value || '')}
          />

          {/* Descripción de la actividad (RF04 - varchar(255)) */}
          <IonLabel className="actividad-form-label">
            Descripción
            <IonText className="actividad-asterisco"> (*)</IonText>
          </IonLabel>
          <IonTextarea
            className="actividad-form-textarea"
            value={descripcion}
            maxlength={255}
            rows={4}
            autoGrow={true}
            placeholder="Describa el objetivo, lugar o detalles relevantes de la actividad..."
            onIonInput={(e) => setDescripcion(e.detail.value || '')}
          />
          <IonText className="actividad-contador-texto">
            {descripcion.length}/255 caracteres
          </IonText>

          <IonText className="actividad-nota-obligatorios">
            Los (*) son campos obligatorios
          </IonText>
        </IonCol>
      </IonRow>

      <IonRow className="actividad-acciones-row">
        {onCancel && (
          <IonButton
            fill="outline"
            className="btn-actividad-cancelar"
            onClick={onCancel}
            disabled={cargando}
          >
            Cancelar
          </IonButton>
        )}

        <IonButton
          className="btn-actividad-submit"
          onClick={handleSubmit}
          disabled={formularioIncompleto}
        >
          {cargando
            ? 'Guardando...'
            : esModificar
            ? 'Guardar cambios'
            : 'Registrar actividad'}
        </IonButton>
      </IonRow>
    </IonGrid>
  );
};

export default FormularioActividad;
