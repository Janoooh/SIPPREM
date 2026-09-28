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

interface loginProps{
    setUsuario: (datos: any) => void;
};

const Login: React.FC<loginProps> = ({setUsuario}) => {

  const [identificador, setIdentifier] = useState<string>('');
  const [clave, setPassword] = useState<string>('');
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    console.log('Intento de login:', { identificador, clave });
    if (identificador.trim() === 'admin'){
        setUsuario({
            nombre: 'Usuario de administrador',
            rol: 'ADMIN'
        });
        router.push("/admin/inicio","forward");
    }else if(identificador.trim() === 'supervisor'){
        setUsuario({
            nombre: 'Usuario de supervisor',
            rol: 'SUPERVISOR'
        });
        router.push("/supervisor/inicio","forward");
    }else{
        mandarAlerta({
            header: 'Acceso Denegado',
            subHeader: 'Credenciales de acceso incorrectas',
            message: 'El RUT o la contraseña ingresada no son válidos. Por favor, intente nuevamente.',
            buttons: ['Aceptar']
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
                    onIonInput={(e: any) => setIdentifier(e.detail.value!)}
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
