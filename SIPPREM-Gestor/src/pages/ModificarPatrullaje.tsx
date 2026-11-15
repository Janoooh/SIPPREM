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
  IonSpinner,
  useIonAlert,
  useIonRouter,
  useIonToast
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import MapaPoligono, {
  PuntoMapa,
  convertirGeoJSONAPuntos,
  convertirPuntosAPoligonoWKT
} from '../components/mapaPoligono';
import FormularioPatrullaje from '../components/FormularioPatrullaje';
import { proyectosService } from '../services/proyectosService';
import { trabajadoresService, TrabajadorProyecto } from '../services/trabajadoresService';
import { PatrullajeProyecto, patrullajesService } from '../services/patrullajesService';
import { useUsuario } from '../hooks/obtenerUsuario';
import './AgregarPatrullaje.css';

const extraerFechaYHoraLocal = (
  fechaHoraStr?: string
): { fecha: string; horaMin: string } => {
  if (!fechaHoraStr) return { fecha: '', horaMin: '08:00' };
  const d = new Date(fechaHoraStr);
  if (Number.isNaN(d.getTime())) return { fecha: '', horaMin: '08:00' };

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');

  return {
    fecha: `${y}-${m}-${day}`,
    horaMin: `${hh}:${mm}`
  };
};

const resolverRutEnLista = (
  rutBuscado: string,
  disponibles: TrabajadorProyecto[]
): string => {
  const normalizado = rutBuscado.trim().toLowerCase();
  const encontrado = disponibles.find(
    (t) => t.rut.trim().toLowerCase() === normalizado
  );
  return encontrado ? encontrado.rut : rutBuscado;
};

const ModificarPatrullaje: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto, id_patrullaje } = useParams<{
    id_proyecto: string;
    id_patrullaje: string;
  }>();
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  const [patrullajeSeleccionado, setPatrullajeSeleccionado] =
    useState<PatrullajeProyecto | null>(null);
  const [fecha, setFecha] = useState<string>('');
  const [encargadoRut, setEncargadoRut] = useState<string>('');
  const [acompananteRut, setAcompananteRut] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('08:00');
  const [horaTermino, setHoraTermino] = useState<string>('16:00');

  const [puntosPatrullaje, setPuntosPatrullaje] = useState<PuntoMapa[]>([]);
  const [zonaWKT, setZonaWKT] = useState<string>('');

  const [puntosProyecto, setPuntosProyecto] = useState<PuntoMapa[]>([]);
  const [patrullerosDisponibles, setPatrullerosDisponibles] = useState<
    TrabajadorProyecto[]
  >([]);

  const [cargando, setCargando] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);

  const volverACronograma = () => {
    router.push(`/${rolRuta}/proyecto/${id_proyecto}/cronograma`, 'back');
  };

  useEffect(() => {
    let activo = true;

    const cargarDatosEdicion = async () => {
      if (!id_proyecto || !id_patrullaje) return;
      try {
        setCargando(true);
        const [datosProyecto, datosTrabajadores, listaPatrullajes] =
          await Promise.all([
            proyectosService.obtenerProyectoPorId(String(id_proyecto)),
            trabajadoresService
              .obtenerTrabajadoresProyecto(String(id_proyecto))
              .catch(() => []),
            patrullajesService.obtenerPatrullajesProyecto(String(id_proyecto))
          ]);

        if (!activo) return;

        const encontrado = (listaPatrullajes || []).find(
          (p) => String(p.id_patrullaje) === String(id_patrullaje)
        );

        if (!encontrado) {
          mandarAlerta({
            header: 'Patrullaje no encontrado',
            message: 'No se encontró el patrullaje solicitado en este proyecto.',
            backdropDismiss: false,
            buttons: [
              {
                text: 'Aceptar',
                handler: volverACronograma
              }
            ]
          });
          return;
        }

        if (datosProyecto?.zona_seleccionada) {
          setPuntosProyecto(
            convertirGeoJSONAPuntos(datosProyecto.zona_seleccionada)
          );
        }

        const patrullerosFiltrados = (datosTrabajadores || []).filter(
          (t) => t.tipo_rol?.toLowerCase() === 'patrullero'
        );
        const rutsExistentes = new Set(
          patrullerosFiltrados.map((t) => t.rut.trim().toLowerCase())
        );
        const faltantes: TrabajadorProyecto[] = (encontrado.patrulleros || [])
          .filter((p) => !rutsExistentes.has(p.rut.trim().toLowerCase()))
          .map((p) => ({
            rut: p.rut,
            nombre: p.nombre,
            correo: '',
            telefono: '',
            tipo_rol: 'Patrullero'
          }));
        const listaFinalPatrulleros = [...patrullerosFiltrados, ...faltantes];
        setPatrullerosDisponibles(listaFinalPatrulleros);

        const inicioParsed = extraerFechaYHoraLocal(encontrado.hora_inicio);
        const terminoParsed = extraerFechaYHoraLocal(encontrado.hora_termino);

        setPatrullajeSeleccionado(encontrado);
        setFecha(inicioParsed.fecha);
        setHoraInicio(inicioParsed.horaMin);
        setHoraTermino(terminoParsed.horaMin);

        const asignados = encontrado.patrulleros || [];
        setEncargadoRut(
          asignados[0]?.rut
            ? resolverRutEnLista(asignados[0].rut, listaFinalPatrulleros)
            : ''
        );
        setAcompananteRut(
          asignados[1]?.rut
            ? resolverRutEnLista(asignados[1].rut, listaFinalPatrulleros)
            : ''
        );

        const puntosPat = convertirGeoJSONAPuntos(encontrado.zona);
        setPuntosPatrullaje(puntosPat);
        setZonaWKT(convertirPuntosAPoligonoWKT(puntosPat));

        if (encontrado.estado?.trim().toLowerCase() !== 'planificado') {
          mandarAlerta({
            header: 'Modificación no permitida',
            message: `Solo se pueden modificar patrullajes en estado Planificado. Estado actual: ${encontrado.estado}.`,
            backdropDismiss: false,
            buttons: [
              {
                text: 'Volver al cronograma',
                handler: volverACronograma
              }
            ]
          });
        }
      } catch (error: any) {
        if (!activo) return;
        console.error('Error al cargar patrullaje para modificar:', error);
        mandarAlerta({
          header: 'Error',
          message:
            error.response?.data?.message ||
            'No fue posible cargar la información del patrullaje.',
          backdropDismiss: false,
          buttons: [
            {
              text: 'Aceptar',
              handler: volverACronograma
            }
          ]
        });
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarDatosEdicion();

    return () => {
      activo = false;
    };
  }, [id_proyecto, id_patrullaje]);

  const esPlanificado =
    patrullajeSeleccionado?.estado?.trim().toLowerCase() === 'planificado';

  const handleChangePuntos = (nuevosPuntos: PuntoMapa[], nuevoWKT: string) => {
    if (!esPlanificado) return;
    setPuntosPatrullaje(nuevosPuntos);
    setZonaWKT(nuevoWKT);
  };

  const handleActualizarPatrullaje = async () => {
    if (!id_proyecto || !id_patrullaje || !esPlanificado) return;

    if (!fecha) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe especificar la fecha del patrullaje.',
        buttons: ['Aceptar']
      });
      return;
    }
    if (!encargadoRut) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe seleccionar un encargado de patrullaje.',
        buttons: ['Aceptar']
      });
      return;
    }
    if (!horaInicio || !horaTermino) {
      mandarAlerta({
        header: 'Campo requerido',
        message: 'Debe ingresar la hora de inicio y de término.',
        buttons: ['Aceptar']
      });
      return;
    }
    if (horaInicio === horaTermino) {
      mandarAlerta({
        header: 'Horario inválido',
        message: 'La hora de inicio y de término no pueden ser iguales.',
        buttons: ['Aceptar']
      });
      return;
    }
    if (
      acompananteRut &&
      acompananteRut.toLowerCase() === encargadoRut.toLowerCase()
    ) {
      mandarAlerta({
        header: 'Patrulleros inválidos',
        message: 'El encargado y el acompañante no pueden ser la misma persona.',
        buttons: ['Aceptar']
      });
      return;
    }
    if (puntosPatrullaje.length < 3) {
      mandarAlerta({
        header: 'Zona requerida',
        message:
          'Debe trazar un polígono con al menos 3 vértices en el mapa para delimitar el área de patrullaje.',
        buttons: ['Aceptar']
      });
      return;
    }

    const wktFinal = zonaWKT || convertirPuntosAPoligonoWKT(puntosPatrullaje);

    const horaInicioCompleta = `${fecha} ${horaInicio}:00`;
    let horaTerminoCompleta = `${fecha} ${horaTermino}:00`;

    if (horaTermino < horaInicio) {
      const [y, m, d] = fecha.split('-').map(Number);
      const fechaSiguiente = new Date(y, m - 1, d + 1);
      const sigY = fechaSiguiente.getFullYear();
      const sigM = String(fechaSiguiente.getMonth() + 1).padStart(2, '0');
      const sigD = String(fechaSiguiente.getDate()).padStart(2, '0');
      horaTerminoCompleta = `${sigY}-${sigM}-${sigD} ${horaTermino}:00`;
    }

    const patrulleros = [encargadoRut];
    if (acompananteRut) {
      patrulleros.push(acompananteRut);
    }

    try {
      setGuardando(true);
      await patrullajesService.actualizarPatrullaje(
        String(id_proyecto),
        String(id_patrullaje),
        {
          hora_inicio: horaInicioCompleta,
          hora_termino: horaTerminoCompleta,
          zona: wktFinal,
          patrulleros
        }
      );

      mandarToast({
        message: 'Patrullaje modificado exitosamente.',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      volverACronograma();
    } catch (error: any) {
      console.error('Error al modificar patrullaje:', error);
      mandarAlerta({
        header: 'Error al modificar',
        message:
          error.response?.data?.message ||
          'Ocurrió un error al modificar la planificación del patrullaje.',
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

      <IonContent
        fullscreen
        style={{ '--background': '#4a5e73' } as React.CSSProperties}
      >
        <IonGrid className="agregar-patrullaje-grid ion-padding">
          <IonRow>
            <IonCol size="12" sizeLg="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="cronograma"
              />
            </IonCol>

            <IonCol size="12" sizeLg="9" className="agregar-patrullaje-col">
              <IonLabel className="titulo-registro-patrullaje">
                Modificación de Patrullaje #{patrullajeSeleccionado?.id_patrullaje ?? id_patrullaje}
              </IonLabel>

              {cargando ? (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                patrullajeSeleccionado && (
                  <div className="contenido-registro-patrullaje">
                    {/* Sección Mapa de delimitación */}
                    <div className="mapa-seccion-patrullaje">
                      <MapaPoligono
                        puntos={puntosPatrullaje}
                        puntosReferencia={puntosProyecto}
                        onChangePuntos={handleChangePuntos}
                        altura="380px"
                        soloLectura={!esPlanificado}
                      />
                    </div>

                    {/* Sección Formulario de Patrullaje */}
                    <div className="formulario-seccion-patrullaje">
                      <div>
                        <div className="campo-fecha-patrullaje">
                          <IonLabel className="label-fecha-patrullaje">
                            Fecha:
                          </IonLabel>
                          <IonInput
                            type="date"
                            className="input-fecha-patrullaje"
                            value={fecha}
                            disabled={!esPlanificado}
                            onIonInput={(e) => setFecha(e.detail.value || '')}
                          />
                        </div>

                        <FormularioPatrullaje
                          patrullerosDisponibles={patrullerosDisponibles}
                          encargadoRut={encargadoRut}
                          setEncargadoRut={setEncargadoRut}
                          acompananteRut={acompananteRut}
                          setAcompananteRut={setAcompananteRut}
                          horaInicio={horaInicio}
                          setHoraInicio={setHoraInicio}
                          horaTermino={horaTermino}
                          setHoraTermino={setHoraTermino}
                          deshabilitado={!esPlanificado}
                        />
                      </div>

                      <div className="acciones-patrullaje-container">
                        {esPlanificado && (
                          <IonButton
                            expand="block"
                            className="btn-registrar-submit"
                            onClick={handleActualizarPatrullaje}
                            disabled={guardando}
                          >
                            {guardando ? 'Guardando...' : 'Guardar cambios'}
                          </IonButton>
                        )}

                        <IonButton
                          expand="block"
                          fill="clear"
                          className="btn-cancelar-patrullaje"
                          onClick={volverACronograma}
                          disabled={guardando}
                        >
                          Cancelar
                        </IonButton>
                      </div>
                    </div>
                  </div>
                )
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ModificarPatrullaje;
