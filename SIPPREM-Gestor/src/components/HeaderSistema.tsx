import React from "react";
import {
    IonToolbar,
    IonButtons,
    IonButton,
    IonImg,
    IonText,
    IonTitle
} from '@ionic/react';
import './HeaderSistema.css';

interface HeaderSistemaProps{
    nombreUsuario: string,
    rol: string
};

const HeaderSistema: React.FC<HeaderSistemaProps> = ({nombreUsuario ,rol}) => {

    return(
        <IonToolbar className="inicio-toolbar">
          <IonButtons slot="start">
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="header-logo" />
          </IonButtons>
          <IonTitle className="name-text">
            SIPPREM
          </IonTitle>
          
          {/*Botones del navegador del header.*/}
          <IonButtons slot="end" className="header-nav-buttons">
            
            {rol === 'ADMIN' && 
              (
              <IonButton fill="clear" className="nav-btn-clear" onClick={() => {}}>Usuarios</IonButton>
            )}
            {rol === 'ADMIN' && (
              <IonButton fill="clear" className="nav-btn-clear" onClick={() => {}}>Historial de Proyectos</IonButton>
            )}
            <IonButton fill="clear" className="nav-btn-clear" onClick={() => {}}>Mi perfil</IonButton>
            
          </IonButtons>
        </IonToolbar>
    );

};

export default HeaderSistema;