import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonImg, 
  IonButton, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonText,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon,
  useIonViewDidEnter,
  IonLabel
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './AgregarProyecto.css';
import HeaderSistema from '../components/HeaderSistema';

interface AgregarProyectoProps{
    nombreUsuario: string,
    rol: string
};

// Componente hijo para forzar la recarga del mapa ante cualquier cambio de tamaño
const MapResizer: React.FC = () => {
  const map = useMap();

  /*Funcion para renderizar constantemente el mapa, y no tener problemas de visualizacion.*/
  React.useEffect(() => {

      const t1 = setTimeout(() => map.invalidateSize(), 100);
      const t2 = setTimeout(() => map.invalidateSize(), 300);
      const t3 = setTimeout(() => map.invalidateSize(), 700);
      const t4 = setTimeout(() => map.invalidateSize(), 1500);

      // Observa el contenedor del mapa para detectar cualquier cambio de dimensiones
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
      });
      
      const container = map.getContainer();
      if (container) {
        resizeObserver.observe(container);
      }

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
        resizeObserver.disconnect();
    };
  }, [map]);

  return null;
};

const AgregarProyecto: React.FC<AgregarProyectoProps> = ({nombreUsuario,rol}) => {

  // Estados para los campos del formulario de agregacion
  const [nombre, setNombre] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaTermino, setFechaTermino] = useState<string>('');
  const [presupuesto, setPresupuesto] = useState<string>('');
  const [supervisor, setSupervisor] = useState<string>('');
  
  // Coordenadas de valparaiso
  const position: [number, number] = [-33.0456, -71.6203];

  return (
    <IonPage>
      
      <IonHeader className="ion-no-border">
        <HeaderSistema nombreUsuario={nombreUsuario} rol={rol}/>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="ion-padding custom-container">
          <IonRow>
            
            <IonCol size="12" sizeMd="6" className="form-column">
              <IonText className="section-title">
                <h2>Agregar Proyecto</h2>
              </IonText>
              
              {/*Input de texto para indicar el nombre del proyecto.*/}
              <IonLabel className="label-text">Nombre proyecto</IonLabel>
              <IonInput 
                className="custom-input full-width" 
                value={nombre} 
                onIonInput={e => setNombre(e.detail.value!)} 
              />

              {/*Input de fecha para indicar el inicio del proyecto.*/}
              <IonRow className="date-row">
                <IonLabel className="label-text date-label">Fecha inicio:</IonLabel>
                <IonInput 
                  type="date" 
                  className="custom-input date-input" 
                  value={fechaInicio} 
                  onIonInput={e => setFechaInicio(e.detail.value!)} 
                />
              </IonRow>
              {/*Input de fecha para indicar el termino del proyecto.*/}
              <IonRow className="date-row">
                <IonLabel className="label-text date-label">Fecha termino:</IonLabel>
                <IonInput 
                  type="date" 
                  className="custom-input date-input" 
                  value={fechaTermino} 
                  onIonInput={e => setFechaTermino(e.detail.value!)} 
                />
              </IonRow>

              {/*Input numerico para el presupuesto asignado al proyecto.*/}
              <IonLabel className="label-text">Presupuesto asignado:</IonLabel>
              <IonInput 
                type="number" 
                className="custom-input full-width" 
                value={presupuesto} 
                onIonInput={e => setPresupuesto(e.detail.value!)} 
              />

              {/*Lista desplegable de supervisores.*/}
              <IonLabel className="label-text">Supervisor encargado:</IonLabel>
              <IonSelect 
                className="custom-select full-width" 
                value={supervisor} 
                onIonChange={e => setSupervisor(e.detail.value)}
              >
                <IonSelectOption value="juan">Juan Pérez</IonSelectOption>
                <IonSelectOption value="maria">María Gómez</IonSelectOption>
                <IonSelectOption value="carlos">Carlos López</IonSelectOption>
              </IonSelect>

              {/*Conjunto de patrulleros que trabajaran en el sistema.*/}
              <IonLabel className="label-text">Agregar Patrullero</IonLabel>
              <IonRow className="patrulleros-container ion-no-padding">
                {/*Patrulleros ya agregados.*/}
                <IonCol size="auto" className="patrullero-box ion-no-padding">
                  <IonImg src="/assets/fotoPerfil.png" alt="Patrullero" />
                </IonCol>
                <IonCol size="auto" className="patrullero-box ion-no-padding">
                  <IonImg src="/assets/fotoPerfil.png" alt="Patrullero" />
                </IonCol>
                {/*Boton para agregar mas patrulleros.*/}
                <IonCol size="auto" className="patrullero-add-box ion-no-padding" onClick={() => {}}>
                  <IonIcon icon={addOutline} className="add-icon" />
                </IonCol>
                <IonCol className="patrullero-empty-box ion-no-padding"></IonCol>
              </IonRow>
            </IonCol>

            {/*Mapa interactivo.*/}
            <IonCol size="12" sizeMd="6" className="map-column">
              <IonText className="section-title ion-text-center">
                <h2>Seleccione area del proyecto:</h2>
              </IonText>
              
              <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: '350px', width: '100%', zIndex: 1 }}
              >
                 <MapResizer />
                 <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
              </MapContainer>

              {/*Boton para crear el proyecto*/}
              <IonRow className="ion-justify-content-center ion-margin-top">
                <IonCol size="auto">
                  <IonButton className="crear-proyecto-btn" onClick={() => {}}>
                    Crear Proyecto
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AgregarProyecto;
