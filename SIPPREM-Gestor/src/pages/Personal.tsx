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
  IonIcon,
  IonSpinner,
  useIonAlert,
  useIonToast,
  useIonViewWillEnter
} from '@ionic/react';
import { personCircleOutline, trashOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import { useUsuario } from '../hooks/obtenerUsuario';
import {
  trabajadoresService,
  TrabajadorProyecto,
  TrabajadorDisponible
} from '../services/trabajadoresService';
import './Personal.css';

const Personal: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const { id_proyecto } = useParams<{ id_proyecto: string }>();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Estados de datos
  const [trabajadoresAsignados, setTrabajadoresAsignados] = useState<TrabajadorProyecto[]>([]);
  const [trabajadoresDisponibles, setTrabajadoresDisponibles] = useState<TrabajadorDisponible[]>([]);
  const [rutSeleccionado, setRutSeleccionado] = useState<string>('');

  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Carga los trabajadores asignados al proyecto y los disponibles para asignar según el rol
  const cargarDatos = async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const [listaAsignados, listaDisponibles] = await Promise.all([
        trabajadoresService.obtenerTrabajadoresProyecto(String(id_proyecto)),
        trabajadoresService.obtenerTrabajadoresDisponibles(String(id_proyecto))
      ]);

      setTrabajadoresAsignados(listaAsignados || []);
      setTrabajadoresDisponibles(listaDisponibles || []);
    } catch (error: any) {
      console.error('Error al cargar personal del proyecto:', error);
      mandarAlerta({
        header: 'Error',
        message:
          error.response?.data?.message ||
          'No fue posible cargar la lista de trabajadores.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [id_proyecto]);

  useIonViewWillEnter(() => {
    cargarDatos();
  });

  // Valida que un supervisor solo pueda asignar o retirar patrulleros (los admins tienen acceso total)
  const validarPermisoSupervisor = (
    tipoRolObjetivo: string | undefined,
    accion: 'asignar' | 'retirar'
  ): boolean => {
    if (
      rol?.toLowerCase() === 'supervisor' &&
      tipoRolObjetivo?.toLowerCase() !== 'patrullero'
    ) {
      mandarAlerta({
        header: 'Acción no permitida',
        message:
          accion === 'asignar'
            ? 'Como supervisor, solo puedes asignar patrulleros al proyecto.'
            : 'Como supervisor, solo puedes retirar patrulleros del proyecto.',
        buttons: ['Entendido']
      });
      return false;
    }
    return true;
  };

  // Manejador para agregar un trabajador al proyecto
  const handleAgregarTrabajador = async () => {
    if (!rutSeleccionado) {
      mandarAlerta({
        header: 'Selección requerida',
        message: 'Por favor seleccione un trabajador de la lista.',
        buttons: ['Aceptar']
      });
      return;
    }

    const trabajadorAAsignar = trabajadoresDisponibles.find(
      (t) => t.rut === rutSeleccionado
    );

    if (
      trabajadorAAsignar &&
      !validarPermisoSupervisor(trabajadorAAsignar.tipo_rol, 'asignar')
    ) {
      return;
    }

    try {
      setGuardando(true);
      await trabajadoresService.asignarTrabajadorProyecto(String(id_proyecto), rutSeleccionado);

      mandarToast({
        message: 'Trabajador asignado exitosamente al proyecto.',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      setRutSeleccionado('');
      // Recargar listas actualizadas
      await cargarDatos();
    } catch (error: any) {
      console.error('Error al asignar trabajador:', error);
      mandarAlerta({
        header: 'Error al asignar',
        message:
          error.response?.data?.message ||
          'No fue posible asignar el trabajador al proyecto.',
        buttons: ['Aceptar']
      });
    } finally {
      setGuardando(false);
    }
  };

  // Manejador para remover un trabajador del proyecto
  const handleRemoverTrabajador = (trabajador: TrabajadorProyecto) => {
    if (!validarPermisoSupervisor(trabajador.tipo_rol, 'retirar')) return;

    mandarAlerta({
      header: 'Confirmar retiro',
      subHeader: `${trabajador.nombre} (${trabajador.rut})`,
      message: `¿Está seguro de que desea remover a este ${trabajador.tipo_rol.toLowerCase()} del proyecto?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Remover',
          role: 'destructive',
          handler: async () => {
            try {
              await trabajadoresService.sacarTrabajadorProyecto(
                String(id_proyecto),
                trabajador.rut
              );
              mandarToast({
                message: 'Trabajador retirado del proyecto.',
                duration: 2500,
                color: 'success',
                position: 'bottom'
              });
              await cargarDatos();
            } catch (error: any) {
              console.error('Error al remover trabajador:', error);
              mandarAlerta({
                header: 'Error al remover',
                message:
                  error.response?.data?.message ||
                  'No fue posible retirar al trabajador del proyecto.',
                buttons: ['Aceptar']
              });
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
        <IonGrid className="personal-grid ion-padding">
          <IonRow>
            {/* Columna izquierda: Menú lateral */}
            <IonCol size="12" sizeLg="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="personal"
              />
            </IonCol>

            {/* Contenido principal: Lista de trabajadores y bloque Agregar trabajador */}
            <IonCol size="12" sizeLg="9" className="personal-contenido-col">
              {cargando ? (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                <IonRow>
                  {/* Elemento del medio: Lista de trabajadores que trabajan en el proyecto */}
                  <IonCol size="12" sizeLg="7" sizeXl="8">
                    <IonLabel className="titulo-seccion-personal">
                      Lista de trabajadores
                    </IonLabel>

                    <div className="contenedor-lista-trabajadores">
                      {trabajadoresAsignados.length > 0 ? (
                        trabajadoresAsignados.map((t) => (
                          <div key={t.rut} className="fila-trabajador">
                            <div className="trabajador-info-principal">
                              <div className="trabajador-avatar">
                                <IonIcon icon={personCircleOutline} className="avatar-icono" />
                              </div>
                              <div className="trabajador-textos">
                                <span className="trabajador-nombre-rut">
                                  {t.nombre} ({t.rut})
                                </span>
                                <span
                                  className={`trabajador-rol-badge ${
                                    t.tipo_rol.toLowerCase() === 'supervisor'
                                      ? 'badge-supervisor'
                                      : 'badge-patrullero'
                                  }`}
                                >
                                  {t.tipo_rol}
                                </span>
                              </div>
                            </div>

                            {/* Botón para remover trabajador del proyecto */}
                            <IonIcon
                              icon={trashOutline}
                              className="btn-eliminar-trabajador"
                              title="Remover trabajador del proyecto"
                              onClick={() => handleRemoverTrabajador(t)}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="lista-vacia-trabajadores">
                          No hay trabajadores asignados a este proyecto.
                        </div>
                      )}
                    </div>
                  </IonCol>

                  {/* Componente lateral derecho: Bloque Agregar trabajador con lista desplegable */}
                  <IonCol size="12" sizeLg="5" sizeXl="4">
                    <div className="panel-agregar-trabajador-contenedor">
                      <IonLabel className="titulo-agregar-trabajador">
                        Agregar trabajador
                      </IonLabel>

                      <div className="caja-agregar-trabajador">
                        <div>
                          <IonLabel className="label-select-trabajador">
                            Seleccionar trabajador
                          </IonLabel>
                          <select
                            className="select-trabajador-nuevo"
                            value={rutSeleccionado}
                            onChange={(e) => setRutSeleccionado(e.target.value)}
                          >
                            <option value="">Seleccione un trabajador...</option>
                            {trabajadoresDisponibles.map((u) => (
                              <option key={`usr-${u.rut}`} value={u.rut}>
                                {u.nombre} - {u.tipo_rol} ({u.rut})
                              </option>
                            ))}
                          </select>
                        </div>

                        {trabajadoresDisponibles.length === 0 && (
                          <p className="sin-disponibles-texto">
                            {rol?.toLowerCase() === 'supervisor'
                              ? 'No hay patrulleros disponibles para asignar a este proyecto.'
                              : 'No hay supervisores ni patrulleros disponibles para asignar a este proyecto.'}
                          </p>
                        )}

                        <IonButton
                          className="btn-agregar-trabajador-accion"
                          fill="solid"
                          disabled={guardando || !rutSeleccionado}
                          onClick={handleAgregarTrabajador}
                        >
                          {guardando ? 'Agregando...' : 'Agregar'}
                        </IonButton>
                      </div>
                    </div>
                  </IonCol>
                </IonRow>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Personal;
