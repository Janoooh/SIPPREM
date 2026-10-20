import React from 'react';
import { 
  IonCard, 
  IonCardContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonAvatar, 
  IonImg, 
  IonText, 
  IonButton, 
  IonIcon 
} from '@ionic/react';
import { trashOutline, createOutline, arrowUndoCircleOutline } from 'ionicons/icons';
import './UsuarioCard.css';

/*
  Interfaz UsuarioCardProps: Son los parametros que recibe una usuarioCard. Se componen
  principalmente de los datos principales del usuario, que son nombre, rol, correo y foto.
  Eliminado se usa para saber si se debe mostrar el boton de eliminar o restaurar. Ademas, se
  pueden pasar 3 funciones callback, las cuales seran para el boton de editar, eliminar o
  restaurar.
*/
export interface UsuarioCardProps {
  nombre: string;
  rol: string;
  correo: string;
  foto: string | null;
  eliminado: boolean;
  onEditar?: () => void;
  onEliminar?: () => void;
  onRestaurar?: () => void;
}


const UsuarioCard: React.FC<UsuarioCardProps> = ({ 
  nombre, 
  rol, 
  correo, 
  foto,
  eliminado, 
  onEditar, 
  onEliminar,
  onRestaurar 
}) => {
  return (
    <IonCard className="usuario-card">
      <IonCardContent className="usuario-card-content">
        <IonGrid className="ion-no-padding">
          <IonRow className="ion-align-items-center">
            
            {/*Foto del usuario*/}
            <IonCol size="auto" className="usuario-avatar-col">
              <IonAvatar className="usuario-avatar">
                <IonImg 
                  src={foto || "/assets/fotoPerfil.png"} 
                  alt={nombre} 
                  className="usuario-avatar-img" 
                />
              </IonAvatar>
            </IonCol>

            {/* Contenido de la informacion del usuario.*/}
            <IonCol className="usuario-info-col">
              
              <IonText className="usuario-nombre-rol">
                {nombre} {rol ? `(${rol.toUpperCase()})` : '(SIN ROL)'}
              </IonText>

              <IonText className="usuario-correo">
                {correo}
              </IonText>
            </IonCol>

            {/*Botones para eliminar/restaurar y editar.*/}
            <IonCol size="auto" className="usuario-acciones-col">

              {!eliminado 
                ? <IonButton 
                  fill="clear" 
                  className="usuario-btn-accion usuario-btn-eliminar"
                  onClick={onEliminar}
                  title="Eliminar usuario"
                  >
                    <IonIcon slot="icon-only" icon={trashOutline} />
                  </IonButton>

                : <IonButton 
                  fill="clear" 
                  className="usuario-btn-accion usuario-btn-restaurar"
                  onClick={onRestaurar}
                  title="Restaurar usuario"
                  >
                    <IonIcon slot="icon-only" icon={arrowUndoCircleOutline} />
                  </IonButton>}
              

              <IonButton 
                fill="clear" 
                className="usuario-btn-accion usuario-btn-editar"
                onClick={onEditar}
                title="Editar usuario"
              >
                <IonIcon slot="icon-only" icon={createOutline} />
              </IonButton>
            </IonCol>

          </IonRow>
        </IonGrid>
      </IonCardContent>
    </IonCard>
  );
};

export default UsuarioCard;
