import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonButton, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonText,
  useIonAlert,
  useIonToast,
  useIonRouter
} from '@ionic/react';
import './AgregarProyecto.css';
import HeaderSistema from '../components/HeaderSistema';
import FormularioProyecto from '../components/FormularioProyecto';
import MapaPoligono, { PuntoMapa } from '../components/mapaPoligono';
import { useUsuario } from '../hooks/obtenerUsuario';
import { proyectosService } from '../services/proyectosService';

const AgregarProyecto: React.FC = () => {

  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Estados para los campos del formulario de proyecto
  const [nombre, setNombre] = useState<string>('');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaTermino, setFechaTermino] = useState<string>('');
  const [presupuesto, setPresupuesto] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  // Estados para almacenar la lista de puntos marcados en el mapa y el polígono WKT para el backend
  const [puntosZona, setPuntosZona] = useState<PuntoMapa[]>([]);
  const [zonaSeleccionadaWKT, setZonaSeleccionadaWKT] = useState<string>('');

  // Función encargada de validar los campos y enviar la petición de creación al backend
  const handleCrearProyecto = async () => {

    if (!nombre.trim() || !fechaInicio || !fechaTermino || !presupuesto.trim()) {
      mandarAlerta({
        header: 'Campos incompletos',
        message: 'Por favor, complete todos los campos del formulario del proyecto.',
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

    if (new Date(fechaTermino) < new Date(fechaInicio)) {
      mandarAlerta({
        header: 'Fechas inválidas',
        message: 'La fecha de término debe ser igual o posterior a la fecha de inicio.',
        buttons: ['Aceptar']
      });
      return;
    }

    if (puntosZona.length < 3 || !zonaSeleccionadaWKT) {
      mandarAlerta({
        header: 'Zona no seleccionada',
        message: 'Debe marcar al menos 3 puntos en el mapa para delimitar el área del proyecto.',
        buttons: ['Aceptar']
      });
      return;
    }

    try {
      setCargando(true);

      await proyectosService.crearProyecto({
        nombre_proyecto: nombre.trim(),
        nombre_sector: nombre.trim(),
        presupuesto: presupuestoNumero,
        fecha_inicio: fechaInicio,
        fecha_termino: fechaTermino,
        zona_seleccionada: zonaSeleccionadaWKT
      });

      mandarToast({
        message: '¡Proyecto creado correctamente!',
        duration: 3000,
        position: 'bottom',
        color: 'success'
      });

      router.push('/admin/inicio', 'back');

    } catch (error: any) {
      mandarAlerta({
        header: 'Error al crear proyecto',
        message: error.response?.data?.message || 'No fue posible crear el proyecto.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <IonPage>
      
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol}/>
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="ion-padding custom-container">
          <IonRow>
            
            {/* Columna izquierda: Formulario del proyecto */}
            <IonCol size="12" sizeMd="6" className="form-column">
              <IonText className="section-title">
                <h2>Agregar Proyecto</h2>
              </IonText>
              
              <FormularioProyecto
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

            {/* Columna derecha: Mapa interactivo de selección de polígono */}
            <IonCol size="12" sizeMd="6" className="map-column">
              <IonText className="section-title ion-text-center">
                <h2>Seleccione area del proyecto:</h2>
              </IonText>
              
              {/* Componente MapaPoligono para marcar vértices y deshacer con el botón lateral */}
              <MapaPoligono
                puntos={puntosZona}
                onChangePuntos={(nuevosPuntos, zonaWKT) => {
                  setPuntosZona(nuevosPuntos);
                  setZonaSeleccionadaWKT(zonaWKT);
                }}
              />

              {/* Botón para crear el proyecto */}
              <IonRow className="ion-justify-content-center ion-margin-top">
                <IonCol size="auto">
                  <IonButton
                    className="crear-proyecto-btn"
                    onClick={handleCrearProyecto}
                    disabled={cargando}
                  >
                    {cargando ? 'Creando...' : 'Crear Proyecto'}
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
