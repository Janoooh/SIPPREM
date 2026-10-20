import React, { useState } from 'react';
import { 
  IonContent, 
  IonPage, 
  IonInput, 
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg,
  IonLabel,
  useIonRouter,
  useIonAlert
} from '@ionic/react';
import './CambiarClaveInicial.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { authService } from '../services/authService';

const CambiarClaveInicial: React.FC = () => {
  // Estados para obtener la nueva contraseña ingresada y su confirmacion
  const [nuevaClave, setNuevaClave] = useState<string>('');
  const [confirmarClave, setConfirmarClave] = useState<string>('');

  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  // Cargamos los datos guardados del usuario.
  const {usuario} = useUsuario();

  // Funcion handleCambiarClave: Encargada de modificar la clave del usuario al presionar el boton de cambiar clave.
  // Para lo anterior usa el authService.
  const handleCambiarClave = async () => {
    // Validamos si la clave ingresada y el confirmar clave coinciden.
    if (nuevaClave !== confirmarClave) {
      mandarAlerta({
        header: 'Error',
        subHeader: 'Las claves no coinciden',
        message: 'Por favor, verifique que ambas contraseñas ingresadas sean exactamente iguales.',
        buttons: ['Aceptar']
      });
      return;
    }

    try{

      // Cambiamos la clave del usuario.
      await authService.cambiarClave({identificador: usuario.rut, clave: nuevaClave});

      mandarAlerta({
        header: 'Clave Modificada',
        subHeader: 'Operación exitosa',
        message: 'Su contraseña ha sido cambiada correctamente. Ahora puede iniciar sesión.',
        buttons: [
          {
            text: 'Aceptar',
            handler: () => {
              // Redirige al login tras completar el cambio exitoso
              router.push('/login', 'forward');
            }
          }
        ]
        });
    }catch(error: any){
      mandarAlerta({
        header: "Error.",
        subHeader: "Error en peticion al servidor.",
        message: error.response?.data?.message,
        buttons: ["Aceptar"]
      });
    };
    
    
  };

  return (
    <IonPage>
      
      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        
        <IonGrid className="cambiar-clave-grid">
          <IonRow className="ion-align-items-center ion-justify-content-center cambiar-clave-row">
            <IonCol className="ion-text-center">
              
              <IonCard className="cambiar-clave-card">
                
                
                <IonCardHeader>
                  <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="cambiar-clave-logo" />
                  <IonCardTitle className="cambiar-clave-title">Cambio de Clave Inicial</IonCardTitle>
                </IonCardHeader>

                {/* Formulario de clave nueva, y confirmacion de clave. */}
                <IonCardContent>
                  

                  <IonLabel className="input-label">Ingrese su nueva clave:</IonLabel>
                  <IonInput
                    className="cambiar-clave-input"
                    type="password"
                    value={nuevaClave}
                    onIonInput={(e: any) => setNuevaClave(e.detail.value!)}
                  />


                  <IonLabel className="input-label">Confirme su nueva clave:</IonLabel>
                  <IonInput
                    className="cambiar-clave-input"
                    type="password"
                    value={confirmarClave}
                    onIonInput={(e: any) => setConfirmarClave(e.detail.value!)}
                  />

                  {/* Boton para cambiar la clave. Usa el handleCambiarClave definido anteriormente. */}
                  <IonButton 
                    className="cambiar-clave-button" 
                    shape="round" 
                    onClick={handleCambiarClave}
                    disabled={nuevaClave.trim() === '' || confirmarClave.trim() === ''}
                  >
                    CAMBIAR CLAVE
                  </IonButton>

                </IonCardContent>
              </IonCard>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default CambiarClaveInicial;
