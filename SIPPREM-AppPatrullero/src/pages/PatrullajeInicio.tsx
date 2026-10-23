import React from 'react';
import {
  IonContent,
  IonPage,
  IonImg,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonTabBar,
  IonTabButton
} from '@ionic/react';
import { homeOutline, calendarOutline, personOutline } from 'ionicons/icons';
import './PatrullajeInicio.css';

const PatrullajeInicio: React.FC = () => {
  return (
    <IonPage>
      {/* Contenido principal con el color de fondo personalizado */}
      <IonContent fullscreen className="patrullaje-content">
        <div className="patrullaje-container">
          
          {/* Logo superior */}
          <div className="logo-container">
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="patrullaje-logo" />
          </div>

          {/* Saludo y Nombre Estático */}
          <div className="saludo-section">
            <h2>¡Bienvenido!</h2>
            <h1>Nombre Usuario</h1>
          </div>

          {/* Etiqueta de sección */}
          <div className="seccion-titulo">
            <p>Siguiente Patrullaje:</p>
          </div>

          {/* Tarjeta con los detalles del patrullaje */}
          <IonCard className="patrullaje-card">
            <IonCardContent className="card-content-flex">
              <div className="mapa-container">
                <IonImg src="/assets/fotoPerfil.jpg" alt="Mapa de patrullaje" className="mapa-img" />
              </div>
              <div className="info-patrullaje">
                <p><strong>Hora inicio:</strong> 9:00</p>
                <p><strong>Hora termino :</strong> 7:00</p>
              </div>
            </IonCardContent>
          </IonCard>

          {/* Botón de acción */}
          <div className="boton-container">
            <IonButton expand="block" shape="round" className="btn-iniciar">
              Iniciar patrullaje
            </IonButton>
          </div>

        </div>
      </IonContent>

      {/* Barra de navegación inferior */}
      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="home" href="/patrullero/inicio" className="tab-selected">
          <IonIcon icon={homeOutline} />
        </IonTabButton>
        <IonTabButton tab="calendar" href="/patrullero/calendario">
          <IonIcon icon={calendarOutline} />
        </IonTabButton>
        <IonTabButton tab="profile" href="/patrullero/perfil">
          <IonIcon icon={personOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default PatrullajeInicio;