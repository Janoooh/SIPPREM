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
import { actividadesService } from '../services/actividadesService';
import './InicioProyecto.css';
import { useUsuario } from '../hooks/obtenerUsuario';

const InicioProyecto: React.FC = () => {
  const { usuario } = useUsuario();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const rol = usuario.tipo_rol;
  const [mandarAlerta] = useIonAlert();

  // Estado para almacenar la información del proyecto y sus actividades obtenidas del backend
  const [proyecto, setProyecto] = useState<proyectoPatrullaje | null>(null);
  const [actividades, setActividades] = useState<ActividadFutura[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // Función encargada de consultar GET /proyectos/:id_proyecto y GET /proyectos/:id_proyecto/actividades
  const cargarInformacionProyecto = async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const [datosProyecto, datosActividades] = await Promise.all([
        proyectosService.obtenerProyectoPorId(String(id_proyecto)),
        actividadesService.obtenerActividadesProyecto(String(id_proyecto))
      ]);

      setProyecto(datosProyecto);
      setActividades(datosActividades);
    } catch (error: any) {
      console.error('Error al obtener la información o actividades del proyecto:', error);
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
                  
                  {/* Lista de actividades para el proyecto obtenidas desde el backend */}
                  <IonRow className="actividades-list">
                    <IonCol size="12" sizeMd="10" sizeLg="8" className="ion-no-padding">
                      {actividades.length === 0 ? (
                        <IonLabel style={{ color: '#e0e6ed', fontStyle: 'italic' }}>
                          No hay actividades futuras registradas para este proyecto.
                        </IonLabel>
                      ) : (
                        actividades.map((actividad, index) => (
                          <ActividadFuturaCard
                            key={actividad.id_actividad ?? actividad.id ?? index}
                            actividad={actividad}
                          />
                        ))
                      )}
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
