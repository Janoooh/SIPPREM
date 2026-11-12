import React from 'react';
import {
  IonRow,
  IonInput,
  IonLabel
} from '@ionic/react';
import './FormularioProyecto.css';

export interface FormularioProyectoProps {
  nombre: string;
  setNombre: (valor: string) => void;
  fechaInicio: string;
  setFechaInicio: (valor: string) => void;
  fechaTermino: string;
  setFechaTermino: (valor: string) => void;
  presupuesto: string;
  setPresupuesto: (valor: string) => void;
  modo?: 'agregar' | 'modificar';
}


const FormularioProyecto: React.FC<FormularioProyectoProps> = ({
  nombre,
  setNombre,
  fechaInicio,
  setFechaInicio,
  fechaTermino,
  setFechaTermino,
  presupuesto,
  setPresupuesto,
  modo = 'agregar'
}) => {
  const esModificar = modo === 'modificar';

  return (
    <div className="formulario-proyecto-container">
      {/* Input de texto para indicar el nombre del proyecto (siempre editable) */}
      <IonLabel className="label-text">Nombre proyecto</IonLabel>
      <IonInput
        className="custom-input full-width"
        value={nombre}
        onIonInput={(e) => setNombre(e.detail.value!)}
      />

      {/* Input de fecha para indicar el inicio del proyecto (bloqueado en modo modificar) */}
      <IonRow className="date-row">
        <IonLabel className="label-text date-label">Fecha inicio:</IonLabel>
        <IonInput
          type="date"
          className={`custom-input date-input ${esModificar ? 'custom-input-disabled' : ''}`}
          value={fechaInicio}
          disabled={esModificar}
          readonly={esModificar}
          onIonInput={(e) => setFechaInicio(e.detail.value!)}
        />
      </IonRow>

      {/* Input de fecha para indicar el término del proyecto (bloqueado en modo modificar) */}
      <IonRow className="date-row">
        <IonLabel className="label-text date-label">Fecha termino:</IonLabel>
        <IonInput
          type="date"
          className={`custom-input date-input ${esModificar ? 'custom-input-disabled' : ''}`}
          value={fechaTermino}
          disabled={esModificar}
          readonly={esModificar}
          onIonInput={(e) => setFechaTermino(e.detail.value!)}
        />
      </IonRow>

      {/* Input numérico para el presupuesto asignado al proyecto (siempre editable) */}
      <IonLabel className="label-text">Presupuesto asignado:</IonLabel>
      <IonInput
        type="number"
        className="custom-input full-width"
        value={presupuesto}
        onIonInput={(e) => setPresupuesto(e.detail.value!)}
      />
    </div>
  );
};

export default FormularioProyecto;
