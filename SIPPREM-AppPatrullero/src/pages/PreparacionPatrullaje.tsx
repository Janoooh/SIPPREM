import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonImg,
  useIonRouter,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import './PreparacionPatrullaje.css';
import BarraNavInferior from '../components/barraNavInferior';
import FormularioIniciarPatrullaje from '../components/FormularioIniciarPatrullaje';
import { useParams, useLocation } from 'react-router-dom';
import { vehiculosService, dataVehiculo } from '../services/vehiculoService';
import { eqPersonalService, dataEqPersonal } from '../services/EquipamientoPersonalService';
import { patrullajeService } from '../services/patrullajeService';
import { notificarCambioEstadoPatrullaje } from '../context/seguimientoContext';

const PreparacionPatrullaje: React.FC = () => {
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Extraemos el id_proyecto directamente de la URL
  const { id_proyecto } = useParams<{ id_proyecto: string }>();

  // Extraemos el id_patrullaje desde los query params de la URL
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const id_patrullaje = queryParams.get('id_patrullaje');

  // Estados para vehículos
  const [listaVehiculos, setListaVehiculos] = useState<dataVehiculo[]>([]);
  const [patenteSeleccionada, setPatenteSeleccionada] = useState<string>('');
  const [cargandoVehiculos, setCargandoVehiculos] = useState<boolean>(false);

  // Estados para equipamiento personal de la BD
  const [listaArticulos, setListaArticulos] = useState<dataEqPersonal[]>([]);
  const [articulosSeleccionados, setArticulosSeleccionados] = useState<string[]>([]);
  const [cargandoArticulos, setCargandoArticulos] = useState<boolean>(false);

  // Cargar vehículos y equipamiento personal desde la base de datos usando el id_proyecto
  useEffect(() => {
    const cargarDatosBD = async () => {
      if (!id_proyecto) return;

      try {
        setCargandoVehiculos(true);
        setCargandoArticulos(true);

        // Peticiones paralelas al backend para vehículos y equipamiento personal
        const [vehiculosRes, articulosRes] = await Promise.all([
          vehiculosService.obtenerVehiculos(id_proyecto),
          eqPersonalService.obtenerArticulosPersonales(id_proyecto)
        ]);

        setListaVehiculos(vehiculosRes || []);
        setListaArticulos(articulosRes || []);
      } catch (error) {
        console.error("Error al cargar los recursos del proyecto:", error);
        mandarAlerta({
          header: "Aviso",
          message: "No se pudieron cargar los vehículos o el equipamiento del proyecto.",
          buttons: ["Aceptar"]
        });
      } finally {
        setCargandoVehiculos(false);
        setCargandoArticulos(false);
      }
    };

    cargarDatosBD();
  }, [id_proyecto]);

  const handleIniciarPatrullaje = async () => {
    if (!patenteSeleccionada) {
      mandarAlerta({
        header: "Vehículo requerido",
        message: "Por favor, seleccione la patente del vehículo a utilizar.",
        buttons: ["Aceptar"]
      });
      return;
    }

    if (!id_patrullaje || !id_proyecto) {
      mandarAlerta({
        header: "Error",
        message: "Faltan datos del patrullaje o del proyecto para iniciar.",
        buttons: ["Aceptar"]
      });
      return;
    }

    try {
      await patrullajeService.iniciarPatrullaje(
        id_proyecto,
        Number(id_patrullaje),
        {
          id_vehiculo: patenteSeleccionada,
          eq_personal: articulosSeleccionados
        }
      );

      mandarToast({
        message: "¡Patrullaje iniciado correctamente!",
        duration: 3000,
        position: "bottom",
        color: "success"
      });

      notificarCambioEstadoPatrullaje();

      router.push(
        `/patrullero/proyecto/${id_proyecto}/patrullaje-activo?id_patrullaje=${id_patrullaje}`,
        "forward",
        "replace"
      );

    } catch (error: any) {
      console.error("DETALLE COMPLETO DEL ERROR:", error.response || error);

      const mensajeBackend =
        error.response?.data?.message ||
        error.response?.data?.explicacion ||
        error.message ||
        "No fue posible iniciar el patrullaje.";

      mandarAlerta({
        header: "Error al iniciar",
        message: mensajeBackend,
        buttons: ["Aceptar"]
      });
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="preparacion-content">
        <div className="preparacion-container">

          <div className="logo-container">
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="preparacion-logo" />
          </div>

          <div className="titulo-seccion">
            <h2>Inicio de patrullaje</h2>
          </div>

          <FormularioIniciarPatrullaje
            listaVehiculos={listaVehiculos}
            patenteSeleccionada={patenteSeleccionada}
            setPatenteSeleccionada={setPatenteSeleccionada}
            cargandoVehiculos={cargandoVehiculos}
            listaArticulos={listaArticulos}
            articulosSeleccionados={articulosSeleccionados}
            setArticulosSeleccionados={setArticulosSeleccionados}
            cargandoArticulos={cargandoArticulos}
            onIniciarPatrullaje={handleIniciarPatrullaje}
          />

        </div>
      </IonContent>

      <BarraNavInferior id_proyecto={id_proyecto} />
    </IonPage>
  );
};

export default PreparacionPatrullaje;
