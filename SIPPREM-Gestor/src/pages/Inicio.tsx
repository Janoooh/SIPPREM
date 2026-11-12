import React, { useState, useEffect } from 'react';
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
  IonSpinner,
  useIonRouter,
  useIonAlert,
  useIonViewWillEnter
} from '@ionic/react';
import ProyectoPatrullajeCard from '../components/ProyectoPatrullajeCard';
import HeaderSistema from '../components/HeaderSistema';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import './Inicio.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { proyectosService } from '../services/proyectosService';

const Inicio: React.FC = () => {
  
  // Obtenemos los datos del usuario en sesion mediante el hook useUsuario
  const { usuario } = useUsuario();
  const nombreUsuario = usuario.nombre;
  const rol = usuario.tipo_rol;
  const foto = usuario.foto;

  // Hook de Ionic para mostrar alertas
  const [mandarAlerta] = useIonAlert();

  // Estado para guardar la lista de proyectos obtenidos desde el backend
  const [proyectos, setProyectos] = useState<proyectoPatrullaje[]>([]);

  // Estado para controlar el spinner de carga durante la peticion asincrona
  const [cargando, setCargando] = useState<boolean>(false);

  // Funcion cargarProyectos: Encargada de usar proyectosService para traer desde el
  // endpoint /proyectos del backend la lista de proyectos correspondientes.
  const cargarProyectos = async () => {
    try {
      setCargando(true); // Indicamos que comenzo la carga de datos
      const respuesta = await proyectosService.obtenerProyectos();
      setProyectos(respuesta || []); // Guardamos los proyectos obtenidos en el estado
    } catch (error: any) {
      // Si el backend responde 404 (no hay proyectos para mostrar), dejamos la lista vacia sin alerta de error
      if (error.response?.status === 404) {
        setProyectos([]);
        return;
      }
      console.error("Error al obtener proyectos:", error);
      mandarAlerta({
        header: "Error",
        message: "No fue posible cargar la lista de proyectos.",
        buttons: ["Aceptar"]
      });
    } finally {
      setCargando(false); // Finalizamos la carga de datos
    }
  };

  // Uso de hook useEffect para cargar la lista de proyectos al iniciar el componente.
  useEffect(() => {
    cargarProyectos();
  }, []);

  // Uso de hook useIonViewWillEnter para recargar la lista de proyectos cada vez que se entra a la 
  // ventana, manteniendo siempre la informacion actualizada.
  useIonViewWillEnter(() => {
    cargarProyectos();
  });

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

              {/* Spinner que se muestra mientras se obtienen los proyectos desde el backend */}
              {cargando && (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              )}

              {/* Lista de proyectos obtenidos*/}
              {!cargando && (
                <IonRow>
                  <IonCol size="12">
                    {proyectos.length > 0 ? (
                      proyectos.map((proyecto) => (
                        <ProyectoPatrullajeCard
                          key={proyecto.id_proyecto}
                          proyecto={proyecto}
                          rolUsuario={rol}
                          onProyectoEliminado={(idEliminado) => {
                            setProyectos((prev) => prev.filter((p) => p.id_proyecto !== idEliminado));
                          }}
                        />
                      ))
                    ) : (
                      <IonText style={{ color: 'white' }}>
                        <p>No hay proyectos registrados para mostrar.</p>
                      </IonText>
                    )}
                  </IonCol>
                </IonRow>
              )}

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
                    {rol === 'admin' && (<p>Proyectos activos: {proyectos.length}</p>)}
                    {rol === 'supervisor' && (<p>Proyectos asignados: {proyectos.length}</p>)}
                  </IonText>
                  <IonText className="dashboard-text">
                    {rol === 'admin' && (<p>Proyectos cerrados: 0</p>)}
                    
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
