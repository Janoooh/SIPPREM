import React, { useCallback, useMemo, useState } from 'react';
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
  useIonRouter,
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

// Obtiene la fecha en formato YYYY-MM-DD (hora local) para compararla con el input type="date"
const obtenerFechaLocalYYYYMMDD = (fechaIso: string): string => {
  if (!fechaIso) return '';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) {
    return String(fechaIso).slice(0, 10);
  }
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const HistorialIncidentes: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  const [incidentes, setIncidentes] = useState<IncidenteProyecto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [fechaFiltro, setFechaFiltro] = useState<string>('');

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

  const incidentesFiltrados = useMemo(() => {
    if (!fechaFiltro) return incidentes;
    return incidentes.filter(
      (incidente) => obtenerFechaLocalYYYYMMDD(incidente.fecha_hora) === fechaFiltro
    );
  }, [incidentes, fechaFiltro]);

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
              {/* Cabecera superior con filtro por fecha y contador en texto simple */}
              <div className="historial-topbar">
                <div>
                  <IonLabel className="historial-titulo">Historial de incidentes</IonLabel>
                  <p className="historial-subtitulo">
                    Registro de incidentes reportados durante los patrullajes del proyecto
                  </p>
                </div>

                <div className="historial-topbar-derecha">
                  <div className="grupo-filtro-fecha">
                    <label htmlFor="input-filtro-fecha" className="etiqueta-filtro-fecha">
                      Filtrar por fecha:
                    </label>
                    <input
                      id="input-filtro-fecha"
                      type="date"
                      className="input-filtro-fecha"
                      value={fechaFiltro}
                      onChange={(e) => setFechaFiltro(e.target.value)}
                    />
                    {fechaFiltro && (
                      <button
                        type="button"
                        className="btn-limpiar-fecha"
                        onClick={() => setFechaFiltro('')}
                      >
                        Ver todos
                      </button>
                    )}
                  </div>

                  <span className="historial-contador-texto">
                    Total: {incidentesFiltrados.length}{' '}
                    {incidentesFiltrados.length === 1
                      ? 'incidente registrado'
                      : 'incidentes registrados'}
                  </span>
                </div>
              </div>

              {/* Contenido principal: lista de tarjetas IncidentesCard */}
              {cargando ? (
                <div className="historial-loading-box">
                  <IonSpinner name="crescent" color="light" />
                  <span>Cargando incidentes del proyecto...</span>
                </div>
              ) : incidentesFiltrados.length === 0 ? (
                <div className="historial-vacio-box">
                  <span>
                    {fechaFiltro
                      ? 'No hay incidentes registrados en la fecha seleccionada.'
                      : 'Aún no se han reportado incidentes en este proyecto.'}
                  </span>
                </div>
              ) : (
                <div className="lista-incidentes-cards">
                  {incidentesFiltrados.map((incidente) => (
                    <IncidentesCard
                      key={incidente.id_incidente}
                      incidente={incidente}
                      onVerDetalle={(item) =>
                        router.push(
                          `/${rolRuta}/proyecto/${id_proyecto}/historial/${item.id_incidente}`,
                          'forward'
                        )
                      }
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
