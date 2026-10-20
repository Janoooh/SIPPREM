import React from "react";
import {
    IonToolbar,
    IonButtons,
    IonButton,
    IonImg,
    IonText,
    IonTitle,
    useIonRouter
} from '@ionic/react';
import './HeaderSistema.css';

interface HeaderSistemaProps{
    nombreUsuario: string,
    rol: string
};

const HeaderSistema: React.FC<HeaderSistemaProps> = ({nombreUsuario ,rol}) => {
    const router = useIonRouter();
    const esUsuariosActivo = window.location.pathname.includes('/usuarios');

    return(
        <IonToolbar className="inicio-toolbar">
          <IonButtons slot="start" style={{ cursor: 'pointer' }} onClick={() => router.push(rol === 'admin' ? '/admin/inicio' : '/supervisor/inicio', 'forward')}>
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="header-logo" />
          </IonButtons>
          <IonTitle 
            className="name-text" 
            style={{ cursor: 'pointer' }} 
            onClick={() => router.push(rol === 'admin' ? '/admin/inicio' : '/supervisor/inicio', 'forward')}
          >
            SIPPREM
          </IonTitle>
          
          {/*Botones del navegador del header.*/}
          <IonButtons slot="end" className="header-nav-buttons">
            
            {rol === 'admin' && (
              <IonButton fill="clear" className="nav-btn-clear" onClick={() => {}}>Historial de Proyectos</IonButton>
            )}
            {rol === 'admin' && (
              <IonButton 
                fill="clear" 
                className={esUsuariosActivo ? "nav-btn" : "nav-btn-clear"} 
                onClick={() => router.push('/admin/usuarios', 'forward')}
              >
                Usuarios
              </IonButton>
            )}
            <IonButton fill="clear" className="nav-btn-clear" onClick={() => {}}>Mi perfil</IonButton>
            
          </IonButtons>
        </IonToolbar>
    );

};

export default HeaderSistema;