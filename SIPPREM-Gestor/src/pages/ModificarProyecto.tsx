import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSpinner,
  useIonAlert,
  useIonToast,
  useIonRouter
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import './AgregarProyecto.css';
import HeaderSistema from '../components/HeaderSistema';
import FormularioProyecto from '../components/FormularioProyecto';
import MapaPoligono, {
  PuntoMapa,
  convertirGeoJSONAPuntos,
  convertirPuntosAPoligonoWKT
} from '../components/mapaPoligono';
import { useUsuario } from '../hooks/obtenerUsuario';
import { proyectosService } from '../services/proyectosService';

const ModificarProyecto: React.FC = () => {
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Estados de los campos del formulario
  const [nombre, setNombre] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaTermino, setFechaTermino] = useState<string>('');
  const [presupuesto, setPresupuesto] = useState<string>('');

  // Estados adicionales conservados del proyecto original (bloqueados para edición)
  const [nombreSector, setNombreSector] = useState<string>('');
  const [activo, setActivo] = useState<boolean>(true);
  const [puntosZona, setPuntosZona] = useState<PuntoMapa[]>([]);
  const [zonaSeleccionadaWKT, setZonaSeleccionadaWKT] = useState<string>('');

  // Estados de carga
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Función auxiliar para formatear fechas ISO (YYYY-MM-DDTHH:mm:ss...) a YYYY-MM-DD para el input date
  const formatearFechaInput = (fecha: string | Date | undefined): string => {
    if (!fecha) return '';
    return String(fecha).split('T')[0];
  };

  // Cargar la información del proyecto seleccionado al entrar a la página
  useEffect(() => {
    const cargarProyecto = async () => {
      if (!id_proyecto) return;
      try {
        setCargandoDatos(true);
        const proyecto = await proyectosService.obtenerProyectoPorId(String(id_proyecto));

        setNombre(proyecto.nombre_proyecto || '');
        setNombreSector(proyecto.nombre_sector || proyecto.nombre_proyecto || '');
        setFechaInicio(formatearFechaInput(proyecto.fecha_inicio));
        setFechaTermino(formatearFechaInput(proyecto.fecha_termino));
        setPresupuesto(
          proyecto.presupuesto !== undefined && proyecto.presupuesto !== null
            ? String(proyecto.presupuesto)
            : ''
        );
        setActivo(proyecto.activo ?? true);

        // Convertimos el GeoJSON recibido del backend a lista de puntos [lat, lng] y a WKT
        const puntosExtraidos = convertirGeoJSONAPuntos(proyecto.zona_seleccionada);
        setPuntosZona(puntosExtraidos);
        setZonaSeleccionadaWKT(convertirPuntosAPoligonoWKT(puntosExtraidos));
      } catch (error: any) {
        mandarAlerta({
          header: 'Error al cargar proyecto',
          message:
            error.response?.data?.message ||
            'No fue posible obtener la información del proyecto seleccionado.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                router.push('/admin/inicio', 'back');
              }
            }
          ]
        });
      } finally {
        setCargandoDatos(false);
      }
    };

    cargarProyecto();
  }, [id_proyecto]);

  // Manejador para guardar los cambios permitidos (nombre y presupuesto)
  const handleModificarProyecto = async () => {
    if (!id_proyecto) return;

    if (!nombre.trim() || !presupuesto.trim()) {
      mandarAlerta({
        header: 'Campos incompletos',
        message: 'El nombre del proyecto y el presupuesto asignado no pueden estar vacíos.',
        buttons: ['Aceptar']
      });
      return;
    }

    const presupuestoNumero = Number(presupuesto);
    if (isNaN(presupuestoNumero) || presupuestoNumero < 0) {
      mandarAlerta({
        header: 'Presupuesto inválido',
        message: 'El presupuesto asignado debe ser un monto numérico válido.',
        buttons: ['Aceptar']
      });
      return;
    }

    try {
      setGuardando(true);

      await proyectosService.modificarProyecto(String(id_proyecto), {
        nombre_proyecto: nombre.trim(),
        nombre_sector: nombreSector || nombre.trim(),
        presupuesto: presupuestoNumero,
        fecha_inicio: fechaInicio,
        fecha_termino: fechaTermino,
        zona_seleccionada: zonaSeleccionadaWKT,
        activo: activo
      });

      mandarToast({
        message: '¡Proyecto modificado correctamente!',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });

      router.push('/admin/inicio', 'back');
    } catch (error: any) {
      mandarAlerta({
        header: 'Error al modificar proyecto',
        message: error.response?.data?.message || 'No fue posible actualizar el proyecto.',
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

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="ion-padding custom-container">
          {cargandoDatos ? (
            <IonRow className="ion-justify-content-center ion-margin-top">
              <IonSpinner name="crescent" color="light" />
            </IonRow>
          ) : (
            <IonRow>
              {/* Columna izquierda: Formulario del proyecto en modo modificar */}
              <IonCol size="12" sizeMd="6" className="form-column">
                <IonText className="section-title">
                  <h2>Modificar Proyecto</h2>
                </IonText>

                {/* En modo="modificar", fechaInicio y fechaTermino aparecen bloqueados */}
                <FormularioProyecto
                  modo="modificar"
                  nombre={nombre}
                  setNombre={setNombre}
                  fechaInicio={fechaInicio}
                  setFechaInicio={setFechaInicio}
                  fechaTermino={fechaTermino}
                  setFechaTermino={setFechaTermino}
                  presupuesto={presupuesto}
                  setPresupuesto={setPresupuesto}
                />
              </IonCol>

              {/* Columna derecha: Mapa en modo solo lectura con el área del proyecto bloqueada */}
              <IonCol size="12" sizeMd="6" className="map-column">
                <IonText className="section-title ion-text-center">
                  <h2>Área del proyecto:</h2>
                </IonText>

                <MapaPoligono puntos={puntosZona} soloLectura={true} />

                {/* Botón para guardar los cambios */}
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonCol size="auto">
                    <IonButton
                      className="crear-proyecto-btn"
                      onClick={handleModificarProyecto}
                      disabled={guardando}
                    >
                      {guardando ? 'Guardando...' : 'Guardar Cambios'}
                    </IonButton>
                  </IonCol>
                </IonRow>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ModificarProyecto;
