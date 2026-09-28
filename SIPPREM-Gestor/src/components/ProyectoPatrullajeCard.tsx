import React from 'react';
import { 
  IonCard, 
  IonCardContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonText, 
  IonButton, 
  IonIcon,
  useIonRouter 
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import './ProyectoPatrullajeCard.css';

interface ProyectoPatrullajeCardProps {
  proyecto: proyectoPatrullaje;
  rolUsuario : string;
}

const ProyectoPatrullajeCard: React.FC<ProyectoPatrullajeCardProps> = ({ proyecto , rolUsuario}) => {

  const router = useIonRouter();

  return (
    <IonCard className="proyecto-card">
      <IonCardContent className="proyecto-card-content">
        <IonGrid className="ion-no-padding">
          <IonRow className="ion-align-items-center">
            
            {/* Nombre del proyecto, y sus fechas de duracion.*/}
            <IonCol size="8">
              <IonText className="proyecto-nombre">
                <h3>{proyecto.nombre}</h3>
                <p className="proyecto-fechas">
                  <span className="fecha-label">Inicio:</span> {new Date(proyecto.fechaInicio).toLocaleDateString()} <br />
                  <span className="fecha-label">Término:</span> {new Date(proyecto.fechaTermino).toLocaleDateString()}
                </p>
              </IonText>
            </IonCol>

            {/*Botones para interactuar con el proyecto.*/}
            <IonCol size="4" className="ion-text-right proyecto-acciones">
              <IonRow className="ion-justify-content-end ion-align-items-center">
                <IonButton fill="clear" className="icon-btn" onClick={() => {}}>
                  <IonIcon icon={createOutline} />
                </IonButton>
                <IonButton fill="clear" className="icon-btn" onClick={() => {}}>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              </IonRow>
              <IonRow className="ion-justify-content-end">
                <IonButton className="ver-btn" onClick={() => {router.push(`/${rolUsuario.toLowerCase()}/proyecto/${proyecto.id}`)}}>
                  VER PROYECTO
                </IonButton>
              </IonRow>
            </IonCol>

          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default ProyectoPatrullajeCard;
