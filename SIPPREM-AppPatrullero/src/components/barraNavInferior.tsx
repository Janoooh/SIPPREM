import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, useIonRouter } from '@ionic/react';
import { homeOutline, calendarOutline, personOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import './barraNavInferior.css';

interface BarraNavInferiorProps {
  id_proyecto?: string;
}

const BarraNavInferior: React.FC<BarraNavInferiorProps> = ({ id_proyecto }) => {
  const router = useIonRouter();
  const location = useLocation();

  const esInicio = location.pathname === '/patrullero/inicio';
  const esCalendario = location.pathname.includes('/calendario');
  const esPerfil = location.pathname.includes('/perfil');

  const rutaCalendario = id_proyecto
    ? `/patrullero/proyecto/${id_proyecto}/calendario`
    : '/patrullero/calendario';

  const rutaPerfil = id_proyecto
    ? `/patrullero/proyecto/${id_proyecto}/perfil`
    : '/patrullero/perfil';

  return (
    <IonTabBar slot="bottom" className="custom-tab-bar">
      <IonTabButton
        tab="home"
        className={esInicio ? 'tab-selected' : undefined}
        onClick={() => {
          if (!esInicio) {
            router.push('/patrullero/inicio', 'forward');
          }
        }}
      >
        <IonIcon icon={homeOutline} />
      </IonTabButton>
      <IonTabButton
        tab="calendar"
        onClick={() => {
          if (!esCalendario) {
            router.push(rutaCalendario, 'forward');
          }
        }}
        className={esCalendario ? 'tab-selected' : undefined}
      >
        <IonIcon icon={calendarOutline} />
      </IonTabButton>
      <IonTabButton
        tab="profile"
        onClick={() => {
          if (!esPerfil) {
            router.push(rutaPerfil, 'forward');
          }
        }}
        className={esPerfil ? 'tab-selected' : undefined}
      >
        <IonIcon icon={personOutline} />
      </IonTabButton>
    </IonTabBar>
  );
};

export default BarraNavInferior;
