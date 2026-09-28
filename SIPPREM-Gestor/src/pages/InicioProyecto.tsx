import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonLabel,
  IonButton
} from '@ionic/react';
import HeaderSistema from '../components/HeaderSistema';
import ActividadFuturaCard from '../components/ActividadFuturaCard';
import { ActividadFutura } from '../interfaces/actividadFutura';
import './InicioProyecto.css';

interface InicioProyectoProps {
  nombreUsuario: string;
  rol: string;
}

const InicioProyecto: React.FC<InicioProyectoProps> = ({ nombreUsuario, rol }) => {
  // Datos de ejemplo de actividades futuras para el proyecto.
  const actividades: ActividadFutura[] = [
    { id: 1, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 15, 14, 30) },
    { id: 2, tipoActividad: 'Firmar Contrato', fechaHoraInicio: new Date(2023, 9, 18, 10, 0) },
    { id: 3, tipoActividad: 'Campaña', fechaHoraInicio: new Date(2023, 9, 20, 16, 45) },
    { id: 4, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 21, 16, 45) },
    { id: 5, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 22, 16, 45) }
  ];

  return (
    <IonPage>
      
      <IonHeader className="ion-no-border">
        <HeaderSistema nombreUsuario={nombreUsuario} rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="inicio-proyecto-grid ion-padding">
          <IonRow>
            
            {/*Menu de navegacion del proyecto.*/}
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <IonRow className="menu-container">
                <IonCol size="12" className="ion-no-padding">
                  
                  <IonLabel className="menu-titulo">Menú de Opciones</IonLabel>
                  <IonRow className="menu-divider"></IonRow>
                  
                  {/*Boton incio, donde estamos.*/}
                  <IonButton className="menu-btn menu-btn-activo" expand="block" fill="solid">
                    Inicio
                  </IonButton>
                  <IonRow className="menu-divider"></IonRow>
                  
                  {/*Resto de botones.*/}
                  <IonButton className="menu-btn" expand="block" fill="clear">
                    Cronograma
                  </IonButton>
                  <IonRow className="menu-divider"></IonRow>

                  <IonButton className="menu-btn" expand="block" fill="clear">
                    Inventario
                  </IonButton>
                  <IonRow className="menu-divider"></IonRow>

                  <IonButton className="menu-btn" expand="block" fill="clear">
                    Mapa GPS
                  </IonButton>
                  <IonRow className="menu-divider"></IonRow>

                  <IonButton className="menu-btn" expand="block" fill="clear">
                    Historial de Patrullajes
                  </IonButton>
                  <IonRow className="menu-divider"></IonRow>

                  <IonButton className="menu-btn" expand="block" fill="clear">
                    Personal
                  </IonButton>

                </IonCol>
              </IonRow>
            </IonCol>

            <IonCol size="12" sizeMd="9" className="info-proyecto-col">
              
              <IonLabel className="titulo-proyecto">NOMBRE DEL PROYECTO</IonLabel>
              
              <IonRow className="detalle-row">
                <IonLabel className="detalle-label">Nombre del Sector :</IonLabel>
              </IonRow>
              
              <IonRow className="detalle-row">
                <IonLabel className="detalle-label">Fecha de inicio :</IonLabel>
              </IonRow>
              
              <IonRow className="detalle-row">
                <IonLabel className="detalle-label">Fecha de termino :</IonLabel>
              </IonRow>
              
              <IonRow className="detalle-row">
                <IonLabel className="detalle-label">Jefe supervisor :</IonLabel>
              </IonRow>


              <IonLabel className="titulo-actividades">Actividades futuras :</IonLabel>
              
              {/* Lista de actividades futuras para el proyecto.*/}
              <IonRow className="actividades-list">
                <IonCol size="12" sizeMd="10" sizeLg="8" className="ion-no-padding">
                  {actividades.map(actividad => (
                    <ActividadFuturaCard key={actividad.id} actividad={actividad} />
                  ))}
                </IonCol>
              </IonRow>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default InicioProyecto;
