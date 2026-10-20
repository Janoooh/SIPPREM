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
import React, { useState } from 'react';
import './Login.css';
import { authService } from '../services/authService';

const Login: React.FC = () => {

  const [identificador, setIdentificador] = useState<string>('');
  const [clave, setPassword] = useState<string>('');
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();

  // Funcion handleLogin: Encargada de manejar el inicio de sesion al presionar el boton de iniciar
  const handleLogin = async () => {

    try {
      
      const { datosUsuario } = await authService.iniciarSesion({
        identificador,
        clave
      });

      // Si el usuario es un patrullero no puede acceder al gestor SIPPREM.
      if (datosUsuario.tipo_rol === "patrullero") {
        mandarAlerta({
          header: "Acceso denegado.",
          subHeader: "No tienes acceso al sistema.",
          message: "Este sistema es exclusivo para administradores y supervisores, no para patrulleros.",
          buttons: ["Aceptar"]
        });
        router.push("/login", "forward");
        return;
      }

      if (datosUsuario.nuevo_user === true) {
        // Redirige al cambio obligatorio de clave si es usuario nuevo
        router.push("/cambiar-clave-inicial", "forward");
      } else {
        // Redirige al panel correspondiente (admin o supervisor)
        if (datosUsuario.tipo_rol === "admin" || datosUsuario.tipo_rol === "supervisor") {
          router.push(`/${datosUsuario.tipo_rol}/inicio`, "forward");
        }
      }

    } catch (error: any) {
      
      mandarAlerta({
        header: "Acceso denegado.",
        subHeader: "Error de autenticacion.",
        message: error.response?.data?.message || "No fue posible conectar con el servidor.",
        buttons: ["Aceptar"]
      });
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        
        <IonGrid className="login-grid">
          <IonRow className="ion-align-items-center ion-justify-content-center login-row">
            <IonCol className="ion-text-center">
              
              <IonCard className="login-card">
                
                <IonCardHeader>
                  <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="login-logo" />
                  <IonCardTitle className="login-title">Inicio de sesión</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  
                  <IonLabel className="input-label">Ingrese su correo o rut:</IonLabel>
                  <IonInput
                    className="login-input"
                    type="text"
                    value={identificador}
                    onIonInput={(e: any) => setIdentificador(e.detail.value!)}
                  />

                  <IonLabel className="input-label">Ingrese su clave:</IonLabel>
                  <IonInput
                    className="login-input"
                    type="password"
                    value={clave}
                    onIonInput={(e: any) => setPassword(e.detail.value!)}
                  />

                  <IonButton 
                    className="login-button" 
                    shape="round" 
                    onClick={handleLogin}
                    disabled={identificador.trim() === '' || clave.trim() === ''}
                  >
                    INICIAR
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

export default Login;
