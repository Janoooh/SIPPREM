import React, { useCallback, useState } from 'react';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonLabel,
  IonPage,
  IonRow,
  IonSpinner,
  useIonAlert,
  useIonViewWillEnter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import IncidentesCard from '../components/IncidentesCard';
import { useUsuario } from '../hooks/obtenerUsuario';
import { IncidenteProyecto, incidentesService } from '../services/incidentesService';
import './HistorialIncidentes.css';

const HistorialIncidentes: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const [mandarAlerta] = useIonAlert();

  const [incidentes, setIncidentes] = useState<IncidenteProyecto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const cargarIncidentes = useCallback(async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const lista = await incidentesService.obtenerIncidentesProyecto(id_proyecto);
      setIncidentes(lista || []);
    } catch (error: unknown) {
      let mensajeError = 'No fue posible cargar el historial de incidentes del proyecto.';
      if (isAxiosError(error)) {
        const data = error.response?.data as { message?: string; explicacion?: string } | undefined;
        mensajeError = data?.message || data?.explicacion || mensajeError;
      }
      mandarAlerta({
        header: 'Error',
        message: mensajeError,
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  }, [id_proyecto, mandarAlerta]);

  useIonViewWillEnter(() => {
    void cargarIncidentes();
  });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="historial-incidentes-grid ion-padding">
          <IonRow>
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="historial"
              />
            </IonCol>

            <IonCol size="12" sizeMd="9" className="historial-incidentes-col">
              {/* Cabecera superior */}
              <div className="historial-topbar">
                <div>
                  <IonLabel className="historial-titulo">Historial de incidentes</IonLabel>
                  <p className="historial-subtitulo">
                    Registro de incidentes reportados durante los patrullajes del proyecto
                  </p>
                </div>

                <span className="historial-contador-texto">
                  Total: {incidentes.length}{' '}
                  {incidentes.length === 1
                    ? 'incidente registrado'
                    : 'incidentes registrados'}
                </span>
              </div>

              {/* Contenido principal: lista de tarjetas IncidentesCard */}
              {cargando ? (
                <div className="historial-loading-box">
                  <IonSpinner name="crescent" color="light" />
                  <span>Cargando incidentes del proyecto...</span>
                </div>
              ) : incidentes.length === 0 ? (
                <div className="historial-vacio-box">
                  <span>Aún no se han reportado incidentes en este proyecto.</span>
                </div>
              ) : (
                <div className="lista-incidentes-cards">
                  {incidentes.map((incidente) => (
                    <IncidentesCard
                      key={incidente.id_incidente}
                      incidente={incidente}
                    />
                  ))}
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default HistorialIncidentes;
