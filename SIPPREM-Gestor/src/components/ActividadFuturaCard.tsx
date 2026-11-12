import React from 'react';
import { IonRow, IonCol, IonLabel } from '@ionic/react';
import { ActividadFutura } from '../interfaces/actividadFutura';
import './ActividadFuturaCard.css';

interface ActividadFuturaCardProps {
  actividad: ActividadFutura;
}

const ActividadFuturaCard: React.FC<ActividadFuturaCardProps> = ({ actividad }) => {
  
  // Función para formatear la fecha proveniente del backend (YYYY-MM-DD / ISO) o objeto Date
  const formatFecha = (fechaInput?: Date | string) => {
    if (!fechaInput) return 'Sin fecha';

    // Si es un string en formato ISO o YYYY-MM-DD, extraemos la parte de la fecha para evitar desfases de zona horaria
    if (typeof fechaInput === 'string') {
      const soloFecha = fechaInput.split('T')[0];
      const partes = soloFecha.split('-');
      if (partes.length === 3) {
        const [anio, mes, dia] = partes;
        return `${dia}/${mes}/${anio}`;
      }
    }

    const d = new Date(fechaInput);
    if (isNaN(d.getTime())) return String(fechaInput);

    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const tituloMostrar = actividad.titulo || actividad.tipoActividad || 'Actividad';
  const fechaMostrar = actividad.fecha || actividad.fechaHoraInicio;

  return (
    <IonRow className="actividad-card ion-align-items-center">
      <IonCol size="8">
        <IonLabel className="actividad-tipo">
          {tituloMostrar}
        </IonLabel>
        {actividad.descripcion && (
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#555' }}>
            {actividad.descripcion}
          </p>
        )}
      </IonCol>
      
      <IonCol size="4" className="ion-text-end">
        <IonLabel className="actividad-fecha">
          {formatFecha(fechaMostrar)}
        </IonLabel>
      </IonCol>
    </IonRow>
  );
};

export default ActividadFuturaCard;
