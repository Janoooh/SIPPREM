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
import { apiClient } from '../services/apiClient';
import { Preferences } from '@capacitor/preferences';
import type { dataUsuario } from '../interfaces/dataUsuario';
import { useUsuario } from '../services/obtenerUsuario';

/*interface propsCambiarClaveUsuario {
    usuario : dataUsuario
};*/

const CambiarClaveInicial: React.FC = () => {
  // Estados para capturar la nueva contraseña y su confirmación
  const [nuevaClave, setNuevaClave] = useState<string>('');
  const [confirmarClave, setConfirmarClave] = useState<string>('');

  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  const {usuario} = useUsuario();

  // Función para manejar el proceso y validación del cambio de clave
  const handleCambiarClave = async () => {
    // Validación de coincidencia de contraseñas
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

      const datosPeticion = {idIngresado: usuario.rut ,claveNuevaIng: nuevaClave};
      const resCambiarClave = await apiClient.patch("/auth",datosPeticion);

      // Mensaje de éxito al actualizar la contraseña
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
      {/* Contenedor principal con fondo oscuro correspondiente a la paleta institucional */}
      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        
        {/* Grilla para centrar vertical y horizontalmente la tarjeta */}
        <IonGrid className="cambiar-clave-grid">
          <IonRow className="ion-align-items-center ion-justify-content-center cambiar-clave-row">
            <IonCol className="ion-text-center">
              
              {/* Tarjeta principal con borde celeste y fondo oscuro idéntica al login */}
              <IonCard className="cambiar-clave-card">
                
                {/* Cabecera con logo de SIPPREM y título */}
                <IonCardHeader>
                  <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="cambiar-clave-logo" />
                  <IonCardTitle className="cambiar-clave-title">Cambio de Clave Inicial</IonCardTitle>
                </IonCardHeader>

                {/* Contenido del formulario */}
                <IonCardContent>
                  
                  {/* Primer campo: Ingreso de la nueva clave */}
                  <IonLabel className="input-label">Ingrese su nueva clave:</IonLabel>
                  <IonInput
                    className="cambiar-clave-input"
                    type="password"
                    value={nuevaClave}
                    onIonInput={(e: any) => setNuevaClave(e.detail.value!)}
                  />

                  {/* Segundo campo: Confirmación de la nueva clave */}
                  <IonLabel className="input-label">Confirme su nueva clave:</IonLabel>
                  <IonInput
                    className="cambiar-clave-input"
                    type="password"
                    value={confirmarClave}
                    onIonInput={(e: any) => setConfirmarClave(e.detail.value!)}
                  />

                  {/* Botón para efectuar el cambio de clave */}
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
