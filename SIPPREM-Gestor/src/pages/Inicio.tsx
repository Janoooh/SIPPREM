import React from 'react';
import { 
  IonPage, 
  IonHeader,
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
  IonLabel,
  IonAvatar,
  useIonRouter
} from '@ionic/react';
import ProyectoPatrullajeCard from '../components/ProyectoPatrullajeCard';
import HeaderSistema from '../components/HeaderSistema';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import './Inicio.css';
import { useUsuario } from '../hooks/obtenerUsuario';

const Inicio: React.FC = () => {
  
  const {usuario} = useUsuario();
  const nombreUsuario = usuario.nombre;
  const rol = usuario.tipo_rol;
  const foto = usuario.foto;
  // Creacion de proyectos de ejemplo para mostrarlos en el inicio.
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

  const router = useIonRouter();

  return (
    <IonPage>

      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol}/>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="inicio-grid ion-padding">
          <IonRow>
            

            <IonCol size="12" sizeMd="9" className="ion-padding-end">
              
              {/* Mensajes de bienvenida.*/}
              <IonRow className="ion-align-items-center ion-margin-bottom">
                <IonCol size="auto">
                  <IonAvatar className="profile-avatar">
                    <IonImg src={foto || "/assets/fotoPerfil.png"} alt="Profile" className="profile-picture" />
                  </IonAvatar>
                </IonCol>
                <IonCol>
                  <IonText className="welcome-text">
                    <h1>BIENVENIDO {nombreUsuario !== 'NotData' && nombreUsuario ? nombreUsuario.toUpperCase() : 'USUARIO'}</h1>
                  </IonText>
                  <IonChip className="role-chip">
                    <IonLabel>{rol !== 'NotData' && rol ? rol.toUpperCase() : 'SIN ROL'}</IonLabel>
                  </IonChip>
                </IonCol>
              </IonRow>

              {/*Lista de proyectos existentes.*/}
              <IonRow>
                <IonCol size="12">
                  {proyectos.map((proyecto) => (
                    <ProyectoPatrullajeCard key={proyecto.id} proyecto={proyecto} rolUsuario={rol}/>
                  ))}
                </IonCol>
              </IonRow>

            </IonCol>

            {/*Dashboard, y el boton para agregar proyectos.*/}
            <IonCol size="12" sizeMd="3">
              
              {/*Dashboard de informacion y estadisticas*/}
              <IonCard className="dashboard-card">
                <IonCardHeader className="ion-text-center">
                  <IonCardTitle className="dashboard-title">Estadisticas e informacion</IonCardTitle>
                </IonCardHeader>
                <IonCardContent className="dashboard-content">
                  <IonText className="dashboard-text">
                    {rol === 'admin' && (<p>Proyectos activos: 1</p>)}
                    {rol === 'supervisor' && (<p>Proyectos asignados: 1</p>)}
                  </IonText>
                  <IonText className="dashboard-text">
                    {rol === 'admin' && (<p>Proyectos cerrados: 0</p>)}
                    
                  </IonText>
                  <IonText className="dashboard-text">
                    
                    {rol === 'admin' && (<p>Usuarios registrados: 2</p>)}
                  </IonText>
                </IonCardContent>
              </IonCard>
              
              {/*Boton para agregar mas proyectos.*/}
              {rol === 'admin' && (
              <IonButton 
                expand="block" 
                fill="outline" 
                className="add-project-btn" 
                onClick={() => {router.push("/admin/agregar-proyecto","forward")}}
              >
                Agregar Proyecto
              </IonButton>
              )}

            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Inicio;
