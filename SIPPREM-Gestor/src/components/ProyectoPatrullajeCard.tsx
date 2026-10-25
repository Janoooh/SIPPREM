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
            
            {/* ==========================================================================
               INICIO SECCIÓN MODIFICADA: Uso de campos del backend (nombre_proyecto,
               id_proyecto y fechas opcionales fecha_inicio / fecha_termino)
               ========================================================================== */}
            {/* Nombre del proyecto, y sus fechas de duracion.*/}
            <IonCol size="8">
              <IonText className="proyecto-nombre">
                {/* Mostramos el nombre del proyecto proveniente de la base de datos */}
                <h3>{proyecto.nombre_proyecto}</h3>
                {/* Si el endpoint entrega las fechas de inicio/termino, las formateamos y mostramos */}
                {(proyecto.fecha_inicio || proyecto.fecha_termino) && (
                  <p className="proyecto-fechas">
                    {proyecto.fecha_inicio && (
                      <>
                        <span className="fecha-label">Inicio:</span> {new Date(proyecto.fecha_inicio).toLocaleDateString()} <br />
                      </>
                    )}
                    {proyecto.fecha_termino && (
                      <>
                        <span className="fecha-label">Término:</span> {new Date(proyecto.fecha_termino).toLocaleDateString()}
                      </>
                    )}
                  </p>
                )}
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
                {/* Redireccion a la vista del proyecto usando id_proyecto del backend */}
                <IonButton className="ver-btn" onClick={() => {router.push(`/${rolUsuario.toLowerCase()}/proyecto/${proyecto.id_proyecto}`)}}>
                  VER PROYECTO
                </IonButton>
              </IonRow>
            </IonCol>
            {/* ==========================================================================
               FIN SECCIÓN MODIFICADA
               ========================================================================== */}

          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default ProyectoPatrullajeCard;
