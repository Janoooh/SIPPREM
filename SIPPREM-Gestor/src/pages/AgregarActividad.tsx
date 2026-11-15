import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  useIonAlert,
  useIonToast,
  useIonRouter
} from '@ionic/react';
import { useParams, useLocation } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import FormularioActividad from '../components/FormularioActividad';
import { useUsuario } from '../hooks/obtenerUsuario';
import { actividadesService } from '../services/actividadesService';
import { ActividadPayload } from '../interfaces/actividadPayload';
import './AgregarActividad.css';

const AgregarActividad: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const location = useLocation();
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();
  const [guardando, setGuardando] = useState<boolean>(false);

  // Obtenemos la fecha preseleccionada desde ?fecha=YYYY-MM-DD si proviene del cronograma
  const fechaQuery = new URLSearchParams(location.search).get('fecha') || undefined;

  const volverACronograma = () => {
    router.push(`/${rolRuta}/proyecto/${id_proyecto}/cronograma`, 'back');
  };

  const handleCrearActividad = async (datos: ActividadPayload) => {
    if (!id_proyecto) return;
    try {
      setGuardando(true);
      await actividadesService.crearActividad(String(id_proyecto), datos);

      mandarToast({
        message: 'Actividad registrada exitosamente.',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      volverACronograma();
    } catch (error: any) {
      console.error('Error al registrar actividad:', error);
      mandarAlerta({
        header: 'Error al registrar',
        message:
          error.response?.data?.message ||
          'No fue posible registrar la actividad en el proyecto.',
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
              <FormularioActividad
                modo="agregar"
                fechaInicial={fechaQuery}
                onSubmit={handleCrearActividad}
                onCancel={volverACronograma}
                cargando={guardando}
              />
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AgregarActividad;
