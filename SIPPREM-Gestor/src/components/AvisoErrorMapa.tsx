import React from 'react';
import { IonIcon } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import './AvisoErrorMapa.css';

/*Aviso no bloqueante superpuesto cuando falla la carga de tiles del mapa base.*/
export const AvisoErrorMapa: React.FC = () => {
  return (
    <div className="aviso-error-mapa" role="alert" aria-live="polite">
      <IonIcon icon={warningOutline} className="aviso-error-mapa-icono" aria-hidden="true" />
      <span>No se pudo cargar el mapa base</span>
    </div>
  );
};
