import React from 'react';
import { IonIcon } from '@ionic/react';
import { warningOutline } from 'ionicons/icons';
import './AvisoErrorMapa.css';

interface AvisoErrorMapaProps {
  /* Reduce tamaño y posicionamiento para miniaturas de mapa pequeñas. */
  compacto?: boolean;
}

/*Aviso no bloqueante superpuesto cuando falla la carga de tiles del mapa base.*/
export const AvisoErrorMapa: React.FC<AvisoErrorMapaProps> = ({ compacto = false }) => {
  return (
    <div
      className={compacto ? 'aviso-error-mapa aviso-error-mapa-compacto' : 'aviso-error-mapa'}
      role="alert"
      aria-live="polite"
    >
      <IonIcon icon={warningOutline} className="aviso-error-mapa-icono" aria-hidden="true" />
      <span>{compacto ? 'Sin mapa base' : 'No se pudo cargar el mapa base'}</span>
    </div>
  );
};
