import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonSpinner,
  useIonAlert,
  useIonToast,
  useIonRouter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import FormularioActividad from '../components/FormularioActividad';
import { useUsuario } from '../hooks/obtenerUsuario';
import { actividadesService } from '../services/actividadesService';
import { ActividadFutura } from '../interfaces/actividadFutura';
import { ActividadPayload } from '../interfaces/actividadPayload';
import './AgregarActividad.css';

const ModificarActividad: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto, id_actividad } = useParams<{
    id_proyecto: string;
    id_actividad: string;
  }>();
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  const [actividadSeleccionada, setActividadSeleccionada] = useState<
    ActividadFutura | undefined
  >(undefined);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);

  const volverACronograma = () => {
    router.push(`/${rolRuta}/proyecto/${id_proyecto}/cronograma`, 'back');
  };

  useEffect(() => {
    let activo = true;

    const cargarActividad = async () => {
      if (!id_proyecto || !id_actividad) return;
      try {
        setCargando(true);
        const listaActividades = await actividadesService.obtenerActividadesProyecto(
          String(id_proyecto)
        );
        const encontrada = (listaActividades || []).find(
          (act) => String(act.id_actividad ?? act.id) === String(id_actividad)
        );

        if (!activo) return;

        if (!encontrada) {
          mandarAlerta({
            header: 'Actividad no encontrada',
            message: 'No se encontró la actividad solicitada en este proyecto.',
            buttons: [
              {
                text: 'Aceptar',
                handler: volverACronograma
              }
            ]
          });
          return;
        }

        setActividadSeleccionada(encontrada);
      } catch (error: any) {
        if (!activo) return;
        console.error('Error al cargar actividad:', error);
        mandarAlerta({
          header: 'Error al cargar actividad',
          message:
            error.response?.data?.message ||
            'No fue posible obtener los datos de la actividad.',
          buttons: [
            {
              text: 'Aceptar',
              handler: volverACronograma
            }
          ]
        });
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarActividad();

    return () => {
      activo = false;
    };
  }, [id_proyecto, id_actividad]);

  const handleActualizarActividad = async (datos: ActividadPayload) => {
    if (!id_proyecto || !id_actividad) return;
    try {
      setGuardando(true);
      await actividadesService.actualizarActividad(
        String(id_proyecto),
        String(id_actividad),
        datos
      );

      mandarToast({
        message: 'Actividad actualizada exitosamente.',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      volverACronograma();
    } catch (error: any) {
      console.error('Error al actualizar actividad:', error);
      mandarAlerta({
        header: 'Error al actualizar',
        message:
          error.response?.data?.message ||
          'No fue posible actualizar los datos de la actividad.',
        buttons: ['Aceptar']
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="actividad-pagina-grid ion-padding">
          <IonRow>
            <IonCol size="12" sizeLg="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="cronograma"
              />
            </IonCol>

            <IonCol size="12" sizeLg="9" className="actividad-pagina-contenido-col">
              {cargando ? (
                <IonRow className="ion-justify-content-center actividad-spinner-row">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                <FormularioActividad
                  modo="modificar"
                  actividadInicial={actividadSeleccionada}
                  onSubmit={handleActualizarActividad}
                  onCancel={volverACronograma}
                  cargando={guardando}
                />
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ModificarActividad;
