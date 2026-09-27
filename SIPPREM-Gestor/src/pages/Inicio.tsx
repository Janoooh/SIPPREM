import React from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonImg, 
  IonButton, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonLabel
} from '@ionic/react';
import ProyectoPatrullajeCard from '../components/ProyectoPatrullajeCard';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import './Inicio.css';

interface InicioProps {
  nombreUsuario: string;
  rol: string;
}

const Inicio: React.FC<InicioProps> = ({ nombreUsuario, rol }) => {
  
  // Arreglo de proyectos mockeados, usando la interfaz proyectoPatrullaje
  // Note: the interface expects id (number), nombre, fechaInicio, fechaTermino, presupuestoAsignado
  const proyectos: proyectoPatrullaje[] = [
    {
      id: 1,
      nombre: 'Proyecto Eje Brasil',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      presupuestoAsignado: 1000
    },
    {
      id: 2,
      nombre: 'Patrullajes en Cerro Alegre',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      presupuestoAsignado: 2000
    },
    {
      id: 3,
      nombre: 'Proyecto de patrullaje en Bellavista',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      presupuestoAsignado: 3000
    },
    {
      id: 4,
      nombre: 'Proyecto Las Arboleadas',
      fechaInicio: new Date(),
      fechaTermino: new Date(),
      presupuestoAsignado: 3000
    }
  ];

  return (
    <IonPage>
      {/* Cabecera con fondo oscuro */}
      <IonHeader className="ion-no-border">
        <IonToolbar className="inicio-toolbar">
          <IonButtons slot="start">
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="header-logo" />
          </IonButtons>
          <IonText className="name-text">
            SIPPREM
          </IonText>
          
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
      </IonHeader>

      {/* Contenido principal con fondo azul oscuro */}
      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="inicio-grid ion-padding">
          <IonRow>
            
            {/* Columna Izquierda: Perfil y Lista de Proyectos */}
            <IonCol size="12" sizeMd="9" className="ion-padding-end">
              
              {/* Fila de Bienvenida */}
              <IonRow className="ion-align-items-center ion-margin-bottom">
                <IonCol size="auto">
                  <IonImg src="/assets/fotoPerfil.png" alt="Profile" className="profile-picture" />
                </IonCol>
                <IonCol>
                  <IonText className="welcome-text">
                    <h1>BIENVENIDO {nombreUsuario !== 'NotData' && nombreUsuario ? nombreUsuario.toUpperCase() : 'USUARIO'}</h1>
                  </IonText>
                  <IonChip className="role-chip">
                    <IonLabel>{rol !== 'NotData' && rol ? rol : 'SIN ROL'}</IonLabel>
                  </IonChip>
                </IonCol>
              </IonRow>

              {/* Lista de tarjetas de proyectos */}
              <IonRow>
                <IonCol size="12">
                  {proyectos.map((proyecto) => (
                    <ProyectoPatrullajeCard key={proyecto.id} proyecto={proyecto} />
                  ))}
                </IonCol>
              </IonRow>

            </IonCol>

            {/* Columna Derecha: Dashboard y botón de agregar */}
            <IonCol size="12" sizeMd="3">
              
              <IonCard className="dashboard-card">
                <IonCardHeader className="ion-text-center">
                  <IonCardTitle className="dashboard-title">DASHBOARD</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="dashboard-content">
                  <IonText className="dashboard-text">
                    {rol === 'ADMIN' && (<p>Proyectos activos: 1</p>)}
                    {rol === 'SUPERVISOR' && (<p>Proyectos asignados: 1</p>)}
                  </IonText>
                  <IonText className="dashboard-text">
                    {rol === 'ADMIN' && (<p>Proyectos cerrados: 0</p>)}
                    
                  </IonText>
                  <IonText className="dashboard-text">
                    
                    {rol === 'ADMIN' && (<p>Usuarios registrados: 2</p>)}
                  </IonText>
                </IonCardContent>
              </IonCard>

              <IonButton 
                expand="block" 
                fill="outline" 
                className="add-project-btn" 
                onClick={() => {}}
              >
                Agregar Proyecto
              </IonButton>

            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Inicio;
