import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonLabel,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  useIonRouter,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import './Inventario.css'; 
import './AgregarVehiculo.css'; 
import { useUsuario } from '../hooks/obtenerUsuario';
import { useParams } from 'react-router-dom';
import { vehiculosService, TipoVehiculo } from '../services/vehiculoService';
import { eqVehicularService, EquipamientoVehicular } from '../services/EquipamientoVehicularService';

const AgregarVehiculo: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Estados del formulario de vehículo
  const [tiposVehiculo, setTiposVehiculo] = useState<TipoVehiculo[]>([]);
  const [idTipoSeleccionado, setIdTipoSeleccionado] = useState<number | undefined>(undefined);
  const [nombreVehiculo, setNombreVehiculo] = useState<string>('');
  const [patenteVehiculo, setPatenteVehiculo] = useState<string>('');
  const [cargandoTipos, setCargandoTipos] = useState<boolean>(false);

  // Estados para artículos vehiculares
  const [articulos, setArticulos] = useState<EquipamientoVehicular[]>([]);

  // Cargar datos iniciales al entrar a la vista
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setCargandoTipos(true);
        // Cargar tipos de vehículos
        const tiposV = await vehiculosService.obtenerTiposVehiculo(String(id_proyecto));
        setTiposVehiculo(tiposV);

        // Cargar artículos vehiculares del proyecto
        try {
          const arts = await eqVehicularService.obtenerArticulosVehiculares(String(id_proyecto));
          setArticulos(arts || []);
        } catch (err) {
          // Si devuelve 404 porque no hay artículos aún, lo dejamos vacío sin romper
          setArticulos([]);
        }

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
      } finally {
        setCargandoTipos(false);
      }
    };

    if (id_proyecto) {
      cargarDatosIniciales();
    }
  }, [id_proyecto]);

  // Manejador para registrar el vehículo completo
  const handleRegistrarVehiculo = async () => {
    if (!idTipoSeleccionado || !nombreVehiculo.trim() || !patenteVehiculo.trim()) {
      mandarAlerta({
        header: "Campos incompletos",
        message: "Por favor, complete todos los campos obligatorios del vehículo.",
        buttons: ["Aceptar"]
      });
      return;
    }

    try {
      await vehiculosService.agregarVehiculo(String(id_proyecto), {
        id_item: patenteVehiculo.trim(),
        nombre_vehiculo: nombreVehiculo.trim(),
        id_tipo_vehiculo: Number(idTipoSeleccionado)
      });

      mandarToast({
        message: "¡Vehículo registrado correctamente!",
        duration: 3000,
        position: "bottom",
        color: "success"
      });

      router.push(`/${rolRuta}/proyecto/${id_proyecto}/inventario`, 'back');

    } catch (error: any) {
      mandarAlerta({
        header: "Error al registrar",
        message: error.response?.data?.message || "No fue posible registrar el vehículo.",
        buttons: ["Aceptar"]
      });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen className="agregar-vehiculo-content">
        <IonGrid className="inicio-proyecto-grid ion-padding">
          <IonRow>
            
            {/* Componente reutilizable del Menú Lateral Izquierdo */}
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="inventario"
              />
            </IonCol>

            {/* Columna Central: Formulario de Registro */}
            <IonCol size="12" sizeMd="5" className="ion-padding-start">
              <IonLabel className="titulo-seccion">Agregar vehículo nuevo</IonLabel>

              <div className="formulario-agregar-vehiculo">
                
                {/* Tipo de vehículo (Desplegable) */}
                <div className="form-group-vehiculo">
                  <IonLabel className="form-label-vehiculo">Tipo de vehículo:</IonLabel>
                  <div className="input-container-vehiculo">
                    <IonSelect 
                      value={idTipoSeleccionado} 
                      placeholder={cargandoTipos ? "Cargando tipos..." : "Seleccione un tipo"}
                      onIonChange={e => setIdTipoSeleccionado(e.detail.value)}
                      className="select-tipo-vehiculo"
                    >
                      {tiposVehiculo.map((tipo) => (
                        <IonSelectOption key={tipo.id_tipo_vehiculo} value={tipo.id_tipo_vehiculo}>
                          {tipo.tipo_vehiculo}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
                </div>

                {/* Nombre del vehículo */}
                <div className="form-group-vehiculo">
                  <IonLabel className="form-label-vehiculo">Nombre del vehículo:</IonLabel>
                  <div className="input-container-vehiculo">
                    <IonInput 
                      value={nombreVehiculo}
                      onIonInput={e => setNombreVehiculo(e.detail.value!)}
                      placeholder="Ej. Patrulla 01"
                      className="input-custom-vehiculo"
                    />
                  </div>
                </div>

                {/* Patente del vehículo */}
                <div className="form-group-vehiculo">
                  <IonLabel className="form-label-vehiculo">Patente del vehículo:</IonLabel>
                  <div className="input-container-vehiculo">
                    <IonInput 
                      value={patenteVehiculo}
                      onIonInput={e => setPatenteVehiculo(e.detail.value!)}
                      placeholder="Ej. ABCD-12"
                      className="input-custom-vehiculo"
                    />
                  </div>
                </div>

              </div>
            </IonCol>

            {/* Columna Derecha: Artículos Vehiculares y Botones */}
            <IonCol size="12" sizeMd="4" className="ion-padding-start col-derecha-vehiculo">
              <div>
                <IonLabel className="titulo-seccion">Articulos vehiculares:</IonLabel>
                
                {/* Tabla scrolleable conectada al backend */}
                <div className="tabla-vehiculos-container tabla-articulos-scroll">
                  {articulos.length > 0 ? (
                    articulos.map((art) => (
                      <div className="fila-vehiculo fila-articulo-columna" key={art.id_item}>
                        <span className="articulo-titulo-item">{art.tipo_eq_vehicular}</span>
                        <span className="articulo-sub-item">{art.id_item}</span>
                      </div>
                    ))
                  ) : (
                    <div className="fila-vehiculo ion-justify-content-center">
                      <span style={{ fontSize: '0.9rem', color: '#333' }}>No hay artículos registrados.</span>
                    </div>
                  )}
                </div>

                {/* Botón Agregar Artículo */}
                <IonButton expand="block" className="btn-agregar-articulo" onClick={() => router.push(`/${rolRuta}/proyecto/${id_proyecto}/inventario/articulos/registrar`, 'forward')}>
                  Agregar Articulo
                </IonButton>
              </div>

              {/* Botón Registrar Vehículo principal */}
              <div className="contenedor-btn-registrar">
                <IonButton expand="block" onClick={handleRegistrarVehiculo} className="btn-registrar-vehiculo-final">
                  Registrar vehículo
                </IonButton>
              </div>

            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AgregarVehiculo;
