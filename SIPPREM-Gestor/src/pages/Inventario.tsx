import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonLabel,
  IonButton,
  useIonRouter,
  IonIcon,
  useIonToast,
  useIonAlert,
  useIonViewWillEnter,
  IonSpinner
} from '@ionic/react';
import HeaderSistema from '../components/HeaderSistema';
import './inventario.css';
import './InicioProyecto.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { useParams } from 'react-router';
import { trashOutline } from 'ionicons/icons';

import { vehiculosService, dataVehiculo } from '../services/vehiculoService';
import { eqPersonalService } from '../services/EquipamientoPersonalService';
import { eqVehicularService } from '../services/EquipamientoVehicularService';

const Inventario: React.FC = () => {
    const { usuario } = useUsuario();
    const rol = usuario.tipo_rol;
    const { id_proyecto } = useParams<{ id_proyecto: string }>();
    const router = useIonRouter();

    const [mandarAlerta] = useIonAlert();
    const [mandarToast] = useIonToast();

    // Estados
    const [vehiculos, setVehiculos] = useState<dataVehiculo[]>([]);
    const [eqPersonal, setEqPersonal] = useState<any[]>([]);
    const [eqVehicular, setEqVehicular] = useState<any[]>([]);
    const [cargando, setCargando] = useState<boolean>(false);

    // Cargar inventario desde el backend
    const cargarInventario = async () => {
        try {
            setCargando(true);
            const resVehiculos = await vehiculosService.obtenerVehiculos(String(id_proyecto)).catch(() => []);
            const resPersonal = await eqPersonalService.obtenerArticulosPersonales(String(id_proyecto)).catch(() => []);
            const resVehicular = await eqVehicularService.obtenerArticulosVehiculares(String(id_proyecto)).catch(() => []);

            setVehiculos(resVehiculos || []);
            setEqPersonal(resPersonal || []);
            setEqVehicular(resVehicular || []);
        } catch (error) {
            console.error("Error al obtener el inventario:", error);
            mandarAlerta({
                header: "Error",
                message: "No fue posible cargar los registros del inventario.",
                buttons: ["Aceptar"]
            });
        } finally {
            setCargando(false);
        }
    };

    useIonViewWillEnter(() => {
        if (id_proyecto) {
            cargarInventario();
        }
    });

    // 1. Mostrar detalles de Vehículo
    const handleVerDetallesVehiculo = (vehiculo: any) => {
        mandarAlerta({
            header: 'Información del Vehículo',
            subHeader: vehiculo.nombre_vehiculo,
            message: `Patente / ID: ${vehiculo.id_item} \nNombre: ${vehiculo.nombre_vehiculo} \nTipo: ${vehiculo.tipo_vehiculo || 'No especificado'}`,
            buttons: ['Cerrar']
        });
    };

    // 2. Mostrar detalles de Equipamiento Personal
    const handleVerDetallesPersonal = (item: any) => {
        mandarAlerta({
            header: 'Equipamiento Personal',
            subHeader: item.tipo_eq_personal,
            message: `Identificador: ${item.id_item} \nTalla: ${item.talla || 'No especificada'}`,
            buttons: ['Cerrar']
        });
    };

    // 3. Mostrar detalles de Equipamiento Vehicular
    const handleVerDetallesVehicularItem = (item: any) => {
        mandarAlerta({
            header: 'Equipamiento Vehicular',
            subHeader: item.tipo_eq_vehicular,
            message: `Identificador: ${item.id_item} \nVehículo Asociado: ${item.id_vehiculo || 'Ninguno'}`,
            buttons: ['Cerrar']
        });
    };

    // Función para eliminar un vehículo
    const handleEliminarVehiculo = (e: React.MouseEvent, vehiculoSeleccionado: dataVehiculo) => {
        e.stopPropagation(); 
        mandarAlerta({
            header: 'Confirmar eliminación',
            subHeader: `${vehiculoSeleccionado.nombre_vehiculo} - ${vehiculoSeleccionado.id_item}`,
            message: '¿Está seguro de que desea eliminar este vehículo?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    handler: async () => {
                        try {
                            await vehiculosService.eliminarVehiculo(String(id_proyecto), vehiculoSeleccionado.id_item);
                            setVehiculos((prev) => prev.filter((v) => v.id_item !== vehiculoSeleccionado.id_item));
                            mandarToast({ message: 'Vehículo eliminado', duration: 2500, color: 'success', position: 'bottom' });
                        } catch (error: any) {
                            mandarAlerta({ header: 'Error', message: 'No fue posible eliminar el vehículo.', buttons: ['Aceptar'] });
                        }
                    }
                }
            ]
        });
    };

    // Función para eliminar Equipamiento Personal
    const handleEliminarEqPersonal = (e: React.MouseEvent, itemSeleccionado: any) => {
        e.stopPropagation();
        mandarAlerta({
            header: 'Confirmar eliminación',
            subHeader: `${itemSeleccionado.tipo_eq_personal} (${itemSeleccionado.id_item})`,
            message: '¿Está seguro de que desea eliminar este equipamiento personal?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    handler: async () => {
                        try {
                            await eqPersonalService.eliminarArticuloPersonal(String(id_proyecto), itemSeleccionado.id_item);
                            setEqPersonal((prev) => prev.filter((i) => i.id_item !== itemSeleccionado.id_item));
                            mandarToast({ message: 'Equipamiento personal eliminado', duration: 2500, color: 'success', position: 'bottom' });
                        } catch (error: any) {
                            mandarAlerta({ header: 'Error', message: 'No fue posible eliminar el elemento.', buttons: ['Aceptar'] });
                        }
                    }
                }
            ]
        });
    };

    // Función para eliminar Equipamiento Vehicular
    const handleEliminarEqVehicular = (e: React.MouseEvent, itemSeleccionado: any) => {
        e.stopPropagation();
        mandarAlerta({
            header: 'Confirmar eliminación',
            subHeader: `${itemSeleccionado.tipo_eq_vehicular} (${itemSeleccionado.id_item})`,
            message: '¿Está seguro de que desea eliminar este equipamiento vehicular?',
            buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                    text: 'Eliminar',
                    handler: async () => {
                        try {
                            await eqVehicularService.eliminarArticuloVehicular(String(id_proyecto), itemSeleccionado.id_item);
                            setEqVehicular((prev) => prev.filter((i) => i.id_item !== itemSeleccionado.id_item));
                            mandarToast({ message: 'Equipamiento vehicular eliminado', duration: 2500, color: 'success', position: 'bottom' });
                        } catch (error: any) {
                            mandarAlerta({ header: 'Error', message: 'No fue posible eliminar el elemento.', buttons: ['Aceptar'] });
                        }
                    }
                }
            ]
        });
    };

    return (
      <IonPage>
        <IonHeader className="ion-no-border">
          <HeaderSistema rol={rol} />
        </IonHeader>

        <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
          <IonGrid className="inicio-proyecto-grid ion-padding">
            <IonRow>
              
              {/* Menú Lateral */}
              <IonCol size="12" sizeMd="3" className="menu-lateral-col">
                <IonRow className="menu-container">
                  <IonCol size="12" className="ion-no-padding">
                    <IonLabel className="menu-titulo">Menú de Opciones</IonLabel>
                    <IonRow className="menu-divider"></IonRow>
                    
                    <IonButton className="menu-btn" expand="block" fill="clear" onClick={() => router.push(`/supervisor/proyecto/${id_proyecto}`, 'forward')}>
                      Inicio
                    </IonButton>
                    <IonRow className="menu-divider"></IonRow>
                    
                    <IonButton className="menu-btn" expand="block" fill="clear">Cronograma</IonButton>
                    <IonRow className="menu-divider"></IonRow>

                    <IonButton className="menu-btn menu-btn-activo" expand="block" fill="solid">Inventario</IonButton>
                    <IonRow className="menu-divider"></IonRow>

                    <IonButton className="menu-btn" expand="block" fill="clear">Mapa GPS</IonButton>
                    <IonRow className="menu-divider"></IonRow>

                    <IonButton className="menu-btn" expand="block" fill="clear">Historial de Patrullajes</IonButton>
                    <IonRow className="menu-divider"></IonRow>

                    <IonButton className="menu-btn" expand="block" fill="clear">Personal</IonButton>
                  </IonCol>
                </IonRow>
              </IonCol>

              {/* Contenido Principal */}
              <IonCol size="12" sizeMd="9" className="info-proyecto-col ion-padding-start">
                
                {/* SECCIÓN 1: Registro de Vehículos */}
                <div className="header-seccion-inventario">
                  <IonLabel className="titulo-seccion">Registro de vehículo</IonLabel>
                  <IonButton 
                    className="btn-agregar-vehiculo" 
                    fill="solid"
                    onClick={() => router.push(`/supervisor/proyecto/${id_proyecto}/inventario/vehiculos/agregar`, 'forward')}
                  >
                    Agregar vehículo
                  </IonButton>
                </div>

                {cargando ? (
                  <IonRow className="ion-justify-content-center ion-margin-top">
                    <IonSpinner name="crescent" color="light" />
                  </IonRow>
                ) : (
                  <div className="tabla-vehiculos-container">
                    {vehiculos.length > 0 ? (
                      vehiculos.map((vehiculo) => (
                        <div 
                          className="fila-vehiculo" 
                          key={vehiculo.id_item} 
                          onClick={() => handleVerDetallesVehiculo(vehiculo)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="vehiculo-info-columna">
                            <span className="vehiculo-tipo">{vehiculo.nombre_vehiculo}</span>
                            <span className="vehiculo-patente">{vehiculo.id_item}</span>
                          </div>
                          <IonIcon 
                            icon={trashOutline} 
                            className="icono-eliminar" 
                            onClick={(e) => handleEliminarVehiculo(e, vehiculo)} 
                          />
                        </div>
                      ))
                    ) : (
                      <div className="fila-vehiculo ion-justify-content-center">
                        <span>No hay vehículos registrados.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* SECCIÓN 2: Registro de Artículos */}
                <div className="header-seccion-inventario ion-margin-top">
                  <IonLabel className="titulo-seccion">Registro de Artículos</IonLabel>
                  <IonButton 
                    className="btn-agregar-vehiculo" 
                    fill="solid"
                    onClick={() => router.push(`/supervisor/proyecto/${id_proyecto}/inventario/articulos/registrar`, 'forward')}
                  >
                    Registrar Artículo
                  </IonButton>
                </div>

                {/* Doble tabla para Equipamiento Personal y Vehicular con scroll independiente */}
                <div className="articulos-doble-tabla-wrapper">
                  
                  {/* Tabla Equipamiento Personal */}
                  <div className="columna-tabla-articulo">
                    <IonLabel className="subtitulo-tabla">Equipamiento Personal</IonLabel>
                    <div className="tabla-articulos-container">
                      {eqPersonal.length > 0 ? (
                        eqPersonal.map((item) => (
                          <div 
                            className="fila-articulo" 
                            key={item.id_item}
                            onClick={() => handleVerDetallesPersonal(item)}
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <span>{item.tipo_eq_personal}</span>
                              <span style={{ fontSize: '0.85rem', color: '#555', display: 'block' }}>{item.id_item}</span>
                            </div>
                            <IonIcon icon={trashOutline} className="icono-eliminar" onClick={(e) => handleEliminarEqPersonal(e, item)} />
                          </div>
                        ))
                      ) : (
                        <div className="fila-articulo ion-justify-content-center">
                          <span>No hay equipamiento personal.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tabla Equipamiento Vehicular */}
                  <div className="columna-tabla-articulo">
                    <IonLabel className="subtitulo-tabla">Equipamiento Vehicular</IonLabel>
                    <div className="tabla-articulos-container">
                      {eqVehicular.length > 0 ? (
                        eqVehicular.map((item) => (
                          <div 
                            className="fila-articulo" 
                            key={item.id_item}
                            onClick={() => handleVerDetallesVehicularItem(item)}
                            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                          >
                            <div>
                              <span>{item.tipo_eq_vehicular}</span>
                              <span style={{ fontSize: '0.85rem', color: '#555', display: 'block' }}>{item.id_item}</span>
                            </div>
                            <IonIcon icon={trashOutline} className="icono-eliminar" onClick={(e) => handleEliminarEqVehicular(e, item)} />
                          </div>
                        ))
                      ) : (
                        <div className="fila-articulo ion-justify-content-center">
                          <span>No hay equipamiento vehicular.</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </IonCol>

            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
};

export default Inventario;