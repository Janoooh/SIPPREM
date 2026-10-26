import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonLabel,
  IonSpinner,
  useIonAlert,
  useIonViewWillEnter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import ActividadFuturaCard from '../components/ActividadFuturaCard';
import { ActividadFutura } from '../interfaces/actividadFutura';
import { proyectoPatrullaje } from '../interfaces/proyectoPatrullaje';
import { proyectosService } from '../services/proyectosService';
import './InicioProyecto.css';
import { useUsuario } from '../hooks/obtenerUsuario';

const InicioProyecto: React.FC = () => {
  // Datos de ejemplo de actividades futuras para el proyecto.
  const actividades: ActividadFutura[] = [
    { id: 1, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 15, 14, 30) },
    { id: 2, tipoActividad: 'Firmar Contrato', fechaHoraInicio: new Date(2023, 9, 18, 10, 0) },
    { id: 3, tipoActividad: 'Campaña', fechaHoraInicio: new Date(2023, 9, 20, 16, 45) },
    { id: 4, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 21, 16, 45) },
    { id: 5, tipoActividad: 'Patrullaje', fechaHoraInicio: new Date(2023, 9, 22, 16, 45) }
  ];

  const { usuario } = useUsuario();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const rol = usuario.tipo_rol;
  const [mandarAlerta] = useIonAlert();

  // Estado para almacenar la información del proyecto obtenida del backend
  const [proyecto, setProyecto] = useState<proyectoPatrullaje | null>(null);
  const [cargando, setCargando] = useState<boolean>(false);

  // Función encargada de consultar GET /proyectos/:id_proyecto mediante proyectosService
  const cargarInformacionProyecto = async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const datosProyecto = await proyectosService.obtenerProyectoPorId(String(id_proyecto));
      setProyecto(datosProyecto);
    } catch (error: any) {
      console.error('Error al obtener la información del proyecto:', error);
      mandarAlerta({
        header: 'Error',
        message:
          error.response?.data?.message ||
          'No fue posible cargar la información del proyecto.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  };

  // Cargamos la información al montar el componente o cambiar el id_proyecto
  useEffect(() => {
    cargarInformacionProyecto();
  }, [id_proyecto]);

  // Recargamos la información cada vez que se entra a la vista
  useIonViewWillEnter(() => {
    cargarInformacionProyecto();
  });

  return (
    <IonPage>
      
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="inicio-proyecto-grid ion-padding">
          <IonRow>
            
            {/* Componente reutilizable del menú de navegación lateral del proyecto */}
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="inicio"
              />
            </IonCol>

            <IonCol size="12" sizeMd="9" className="info-proyecto-col">
              {cargando ? (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                <>
                  {/* Título principal con el nombre del proyecto obtenido del backend */}
                  <IonLabel className="titulo-proyecto">
                    {proyecto?.nombre_proyecto || 'PROYECTO SIN NOMBRE'}
                  </IonLabel>
                  
                  <IonRow className="detalle-row">
                    <IonLabel className="detalle-label">
                      Fecha de inicio :{' '}
                      {proyecto?.fecha_inicio
                        ? new Date(proyecto.fecha_inicio).toLocaleDateString()
                        : 'No especificada'}
                    </IonLabel>
                  </IonRow>
                  
                  <IonRow className="detalle-row">
                    <IonLabel className="detalle-label">
                      Fecha de termino :{' '}
                      {proyecto?.fecha_termino
                        ? new Date(proyecto.fecha_termino).toLocaleDateString()
                        : 'No especificada'}
                    </IonLabel>
                  </IonRow>
                  
                  <IonRow className="detalle-row">
                    <IonLabel className="detalle-label">
                      Presupuesto asignado :{' '}
                      {proyecto?.presupuesto !== undefined && proyecto?.presupuesto !== null
                        ? `$${Number(proyecto.presupuesto).toLocaleString('es-CL')}`
                        : 'No especificado'}
                    </IonLabel>
                  </IonRow>

                  <IonRow className="detalle-row">
                    <IonLabel className="detalle-label">
                      Estado :{' '}
                      {proyecto?.activo !== undefined
                        ? proyecto.activo
                          ? 'Activo'
                          : 'Cerrado'
                        : 'Activo'}
                    </IonLabel>
                  </IonRow>

                  <IonLabel className="titulo-actividades">Actividades futuras :</IonLabel>
                  
                  {/* Lista de actividades futuras para el proyecto.*/}
                  <IonRow className="actividades-list">
                    <IonCol size="12" sizeMd="10" sizeLg="8" className="ion-no-padding">
                      {actividades.map(actividad => (
                        <ActividadFuturaCard key={actividad.id} actividad={actividad} />
                      ))}
                    </IonCol>
                  </IonRow>
                </>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default InicioProyecto;
