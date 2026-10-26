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
  useIonRouter,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import { createOutline, trashOutline } from 'ionicons/icons';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import { proyectosService } from '../services/proyectosService';
import './ProyectoPatrullajeCard.css';

interface ProyectoPatrullajeCardProps {
  proyecto: proyectoPatrullaje;
  rolUsuario: string;
  onProyectoEliminado?: (id_proyecto: number) => void;
}

const ProyectoPatrullajeCard: React.FC<ProyectoPatrullajeCardProps> = ({
  proyecto,
  rolUsuario,
  onProyectoEliminado
}) => {
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Función encargada de confirmar y eliminar el proyecto usando el endpoint DELETE /proyectos/:id_proyecto
  const handleEliminarProyecto = () => {
    mandarAlerta({
      header: 'Confirmar eliminación',
      subHeader: proyecto.nombre_proyecto,
      message: '¿Está seguro de que desea eliminar este proyecto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: async () => {
            try {
              await proyectosService.eliminarProyecto(proyecto.id_proyecto);

              mandarToast({
                message: 'Proyecto eliminado correctamente',
                duration: 2500,
                position: 'bottom',
                color: 'success'
              });

              if (onProyectoEliminado) {
                onProyectoEliminado(proyecto.id_proyecto);
              }
            } catch (error: any) {
              mandarAlerta({
                header: 'Error al eliminar',
                message:
                  error.response?.data?.message ||
                  'No fue posible eliminar el proyecto.',
                buttons: ['Aceptar']
              });
            }
          }
        }
      ]
    });
  };

  return (
    <IonCard className="proyecto-card">
      <IonCardContent className="proyecto-card-content">
        <IonGrid className="ion-no-padding">
          <IonRow className="ion-align-items-center">
            
            {/* Nombre del proyecto, y sus fechas de duracion.*/}
            <IonCol size="8">
              <IonText className="proyecto-nombre">

                <h3>{proyecto.nombre_proyecto}</h3>

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
              {rolUsuario?.toLowerCase() === 'admin' && (
                <IonRow className="ion-justify-content-end ion-align-items-center">
                  {/* Botón para redirigir a la vista de modificar proyecto */}
                  <IonButton
                    fill="clear"
                    className="icon-btn"
                    onClick={() => {
                      router.push(`/admin/proyecto/editar/${proyecto.id_proyecto}`, 'forward');
                    }}
                  >
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  {/* Botón para eliminar el proyecto mediante la API */}
                  <IonButton
                    fill="clear"
                    className="icon-btn"
                    onClick={handleEliminarProyecto}
                  >
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonRow>
              )}
              <IonRow className="ion-justify-content-end">
                {/* Redireccion a la vista del proyecto*/}
                <IonButton className="ver-btn" onClick={() => {router.push(`/${rolUsuario.toLowerCase()}/proyecto/${proyecto.id_proyecto}`)}}>
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
