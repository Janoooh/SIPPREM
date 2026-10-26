import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonContent, 
  IonImg, 
  IonLabel, 
  IonButton, 
  IonSelect, 
  IonSelectOption, 
  IonTabBar, 
  IonTabButton, 
  IonIcon,
  useIonRouter, 
  useIonAlert, 
  useIonToast 
} from '@ionic/react';
import { homeOutline, calendarOutline, personOutline } from 'ionicons/icons';
import './PreparacionPatrullaje.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { useParams, useLocation } from 'react-router-dom';
import { vehiculosService, dataVehiculo } from '../services/vehiculoService';
import { eqPersonalService, dataEqPersonal } from '../services/EquipamientoPersonalService'; // <--- Importamos tu servicio de equipamiento personal
import { patrullajeService } from '../services/patrullajeService';

const PreparacionPatrullaje: React.FC = () => {
  const router = useIonRouter();
  const { usuario } = useUsuario();
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

      router.push(`/patrullero/proyecto/${id_proyecto}/inicio`, "back");

    } catch (error: any) {
      // 1. Esto imprimirá el error exacto que envía tu backend en la consola (F12)
      console.error("DETALLE COMPLETO DEL ERROR:", error.response || error);

      // 2. Intentamos extraer el mensaje de todas las formas posibles
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

          {/* Selección de vehículo */}
          <div className="form-group">
            <IonLabel className="label-form">Patente del vehículo a utilizar:</IonLabel>
            <div className="input-box-patente">
              <IonSelect
                value={patenteSeleccionada}
                placeholder={cargandoVehiculos ? "Cargando vehículos..." : "Seleccione un vehículo"}
                onIonChange={e => setPatenteSeleccionada(e.detail.value)}
                className="select-patente"
              >
                {listaVehiculos.map((vehiculo) => (
                  <IonSelectOption key={vehiculo.id_item} value={vehiculo.id_item}>
                    {vehiculo.id_item} - {vehiculo.nombre_vehiculo}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>

          {/* Título Artículos a utilizar */}
          <div className="seccion-articulos-header">
            <IonLabel className="label-form">Articulos a utilizar (Equipamiento)</IonLabel>
          </div>

          {/* Selección múltiple de equipamiento personal obtenido de la BD */}
          <div className="form-group">
            <div className="input-box-patente">
              <IonSelect
                multiple={true}
                value={articulosSeleccionados}
                placeholder={cargandoArticulos ? "Cargando equipamiento..." : "Seleccione equipamiento personal"}
                onIonChange={e => setArticulosSeleccionados(e.detail.value)}
                className="select-patente"
              >
                {listaArticulos.map((art) => (
                  <IonSelectOption key={art.id_item} value={art.id_item}>
                    {art.tipo_eq_personal} (Talla: {art.talla}) - [{art.id_item}]
                  </IonSelectOption>
                ))}
              </IonSelect>
            </div>
          </div>

          {/* Lista visual de los artículos seleccionados */}
          <div className="lista-articulos-container">
            {articulosSeleccionados.length > 0 ? (
              articulosSeleccionados.map((idItem) => {
                const itemEncontrado = listaArticulos.find(a => a.id_item === idItem);
                return itemEncontrado ? (
                  <div className="fila-articulo-prep" key={idItem}>
                    <span className="articulo-nombre">{itemEncontrado.tipo_eq_personal}</span>
                    <span className="articulo-cantidad">Talla: {itemEncontrado.talla}</span>
                  </div>
                ) : null;
              })
            ) : (
              <p style={{ color: '#aaa', textAlign: 'center', fontSize: '0.9rem' }}>No hay equipamiento seleccionado</p>
            )}
          </div>

          <div className="boton-agregar-container">
            <IonButton fill="outline" className="btn-agregar-articulo" expand="block">
              Agregar articulo
            </IonButton>
          </div>

          <div className="boton-iniciar-container">
            <IonButton expand="block" className="btn-iniciar-patrullaje" onClick={handleIniciarPatrullaje}>
              Iniciar patrullaje
            </IonButton>
          </div>

        </div>
      </IonContent>

      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="home" onClick={() => router.push(`/patrullero/inicio`, "forward")}>
          <IonIcon icon={homeOutline} />
        </IonTabButton>
        <IonTabButton tab="calendar" href={`/patrullero/proyecto/${id_proyecto}/calendario`}>
          <IonIcon icon={calendarOutline} />
        </IonTabButton>
        <IonTabButton tab="profile" href={`/patrullero/proyecto/${id_proyecto}/perfil`}>
          <IonIcon icon={personOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default PreparacionPatrullaje;