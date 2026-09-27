import React from 'react';
import { IonRow, IonCol, IonLabel } from '@ionic/react';
import { ActividadFutura } from '../interfaces/actividadFutura';
import './ActividadFuturaCard.css';

interface ActividadFuturaCardProps {
  actividad: ActividadFutura;
}

const ActividadFuturaCard: React.FC<ActividadFuturaCardProps> = ({ actividad }) => {
  // Función sencilla para formatear fecha a DD/MM/YY HH:MM
  const formatFechaHora = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const DD = pad(date.getDate());
    const MM = pad(date.getMonth() + 1);
    const YY = date.getFullYear().toString().slice(-2);
    const HH = pad(date.getHours());
    const MIN = pad(date.getMinutes());
    return `${DD}/${MM}/${YY} ${HH}:${MIN}`;
  };

  return (
    <IonRow className="actividad-card ion-align-items-center">
      <IonCol size="8">
        <IonLabel className="actividad-tipo">
          {actividad.tipoActividad}
        </IonLabel>
      </IonCol>
      <IonCol size="4" className="ion-text-end">
        <IonLabel className="actividad-fecha">
          {formatFechaHora(actividad.fechaHoraInicio)}
        </IonLabel>
      </IonCol>
    </IonRow>
  );
};

export default ActividadFuturaCard;
