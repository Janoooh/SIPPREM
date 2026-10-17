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
import { apiClient } from '../services/apiClient';
import type { respuestaApi } from '../interfaces/respuestaApi';
import { Preferences } from '@capacitor/preferences';
import type { dataUsuario } from '../interfaces/dataUsuario';

/*interface loginProps{
    setUsuario: (datos: any) => void;
};*/

const Login: React.FC= () => {

  const [identificador, setIdentificador] = useState<string>('');
  const [clave, setPassword] = useState<string>('');
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();

  // Función para manejar el inicio de sesión
  const handleLogin = async () => {

    try{

      setIdentificador(identificador.trim());
      setPassword(clave.trim());

      const datosPeticion = {idIngresado: identificador, claveIngresada: clave};

      const resLogin = await apiClient.post("/auth",datosPeticion);
      const {token,datosUsuario: datosUsuario} = resLogin.data.data;

      const datosUsuarioLower : dataUsuario = {
        rut: datosUsuario.rut.toLowerCase(),
        nombre: datosUsuario.nombre.toLowerCase(),
        correo: datosUsuario.correo.toLowerCase(),
        nuevo_user: datosUsuario.nuevo_user,
        id_rol: datosUsuario.id_rol,
        tipo_rol: datosUsuario.tipo_rol.toLowerCase()
      };

      //await Preferences.remove({key:"token"});
      //await Preferences.remove({key:"usuario"});

      await Preferences.set({key:"token", value: token});
      await Preferences.set({key:"usuario", value: JSON.stringify(datosUsuarioLower)});

      //setUsuario(datosUsuarioLower);


      if (datosUsuario.tipo_rol.toLowerCase() === "patrullero"){
        mandarAlerta({
            header: "Acceso denegado.",
            subHeader: "No tienes acceso al sistema.",
            message: "Este sistema es exclusivo para administradores y supervisores, no para patrulleros.",
            buttons: ["Aceptar"]
          });
        router.push("/login","forward");
        return;
      };

      if (datosUsuario.nuevo_user == true){
        router.push("/cambiar-clave-inicial","forward");
      }else{
        if (datosUsuario.tipo_rol.toLowerCase() === "admin" || datosUsuario.tipo_rol.toLowerCase() === "supervisor"){
            router.push(`/${datosUsuario.tipo_rol.toLowerCase()}/inicio`,"forward");
        };
      };

    }catch(error: any){
      mandarAlerta({
          header: "Acceso denegado.",
          subHeader: "Error de autenticacion.",
          message: error.response?.data?.message,
          buttons: ["Aceptar"]
      });
    };
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
