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
import { useParams, useLocation } from 'react-router-dom';
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
import { patrullajesService } from '../services/patrullajesService';
import { useUsuario } from '../hooks/obtenerUsuario';
import './AgregarPatrullaje.css';

const AgregarPatrullaje: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const router = useIonRouter();
  const location = useLocation();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Obtener fecha inicial desde el query param (?fecha=YYYY-MM-DD) o fecha actual
  const fechaQuery = new URLSearchParams(location.search).get('fecha');
  const fechaPorDefecto = () => {
    if (fechaQuery && /^\d{4}-\d{2}-\d{2}$/.test(fechaQuery)) {
      return fechaQuery;
    }
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [fecha, setFecha] = useState<string>(fechaPorDefecto());
  const [encargadoRut, setEncargadoRut] = useState<string>('');
  const [acompananteRut, setAcompananteRut] = useState<string>('');
  const [horaInicio, setHoraInicio] = useState<string>('08:00');
  const [horaTermino, setHoraTermino] = useState<string>('16:00');

  // Puntos del polígono de patrullaje a crear
  const [puntosPatrullaje, setPuntosPatrullaje] = useState<PuntoMapa[]>([]);
  const [zonaWKT, setZonaWKT] = useState<string>('');

  // Puntos de referencia del proyecto para guiar la delimitación en el mapa
  const [puntosProyecto, setPuntosProyecto] = useState<PuntoMapa[]>([]);
  const [patrullerosDisponibles, setPatrullerosDisponibles] = useState<TrabajadorProyecto[]>([]);

  const [cargando, setCargando] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);

  // Cargar datos iniciales del proyecto (polígono de la zona del proyecto) y trabajadores asignados
  const cargarDatosIniciales = async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const [datosProyecto, datosTrabajadores] = await Promise.all([
        proyectosService.obtenerProyectoPorId(String(id_proyecto)),
        trabajadoresService.obtenerTrabajadoresProyecto(String(id_proyecto)).catch(() => [])
      ]);

      if (datosProyecto?.zona_seleccionada) {
        const puntos = convertirGeoJSONAPuntos(datosProyecto.zona_seleccionada);
        setPuntosProyecto(puntos);
      }

      // Filtrar solo los trabajadores cuyo rol sea Patrullero
      const patrulleros = (datosTrabajadores || []).filter(
        (t) => t.tipo_rol?.toLowerCase() === 'patrullero'
      );
      setPatrullerosDisponibles(patrulleros);
    } catch (error: any) {
      console.error('Error al cargar datos para agregar patrullaje:', error);
      mandarAlerta({
        header: 'Error',
        message: 'No fue posible cargar la información del proyecto o trabajadores.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosIniciales();
  }, [id_proyecto]);

  // Manejar el cambio de puntos trazados en el mapa
  const handleChangePuntos = (nuevosPuntos: PuntoMapa[], nuevoWKT: string) => {
    setPuntosPatrullaje(nuevosPuntos);
    setZonaWKT(nuevoWKT);
  };

  // Enviar el nuevo patrullaje al backend
  const handleRegistrarPatrullaje = async () => {
    if (!fecha) {
      mandarAlerta({ header: 'Campo requerido', message: 'Debe especificar la fecha del patrullaje.', buttons: ['Aceptar'] });
      return;
    }
    if (!encargadoRut) {
      mandarAlerta({ header: 'Campo requerido', message: 'Debe seleccionar un encargado de patrullaje.', buttons: ['Aceptar'] });
      return;
    }
    if (!horaInicio || !horaTermino) {
      mandarAlerta({ header: 'Campo requerido', message: 'Debe ingresar la hora de inicio y de término.', buttons: ['Aceptar'] });
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

    if (puntosPatrullaje.length < 3) {
      mandarAlerta({
        header: 'Zona requerida',
        message: 'Debe trazar un polígono con al menos 3 vértices en el mapa para delimitar el área de patrullaje.',
        buttons: ['Aceptar']
      });
      return;
    }

    const wktFinal = zonaWKT || convertirPuntosAPoligonoWKT(puntosPatrullaje);

    // Unir fecha con hora en formato YYYY-MM-DD HH:MM:00
    const horaInicioCompleta = `${fecha} ${horaInicio}:00`;
    let horaTerminoCompleta = `${fecha} ${horaTermino}:00`;

    // Si la hora de término es numéricamente menor que la de inicio, corresponde a un turno nocturno
    // que finaliza en la madrugada del día siguiente
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
      await patrullajesService.crearPatrullaje(String(id_proyecto), {
        hora_inicio: horaInicioCompleta,
        hora_termino: horaTerminoCompleta,
        zona: wktFinal,
        patrulleros
      });

      mandarToast({
        message: 'Patrullaje registrado exitosamente.',
        duration: 2500,
        color: 'success',
        position: 'bottom'
      });

      // Redirigir de regreso al Cronograma
      router.push(`/${rolRuta}/proyecto/${id_proyecto}/cronograma`, 'back');
    } catch (error: any) {
      console.error('Error al registrar patrullaje:', error);
      mandarAlerta({
        header: 'Error al registrar',
        message:
          error.response?.data?.message ||
          'Ocurrió un error al registrar la planificación del patrullaje.',
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

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="agregar-patrullaje-grid ion-padding">
          <IonRow>
            {/* Menú lateral */}
            <IonCol size="12" sizeLg="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="cronograma"
              />
            </IonCol>

            {/* Contenido principal: Registro de patrullaje */}
            <IonCol size="12" sizeLg="9" className="agregar-patrullaje-col">
              <IonLabel className="titulo-registro-patrullaje">
                Registro de Patrullaje
              </IonLabel>

              {cargando ? (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                <div className="contenido-registro-patrullaje">
                  {/* Sección Mapa de delimitación */}
                  <div className="mapa-seccion-patrullaje">
                    <MapaPoligono
                      puntos={puntosPatrullaje}
                      puntosReferencia={puntosProyecto}
                      onChangePuntos={handleChangePuntos}
                      altura="380px"
                    />
                  </div>

                  {/* Sección Formulario de Patrullaje */}
                  <div className="formulario-seccion-patrullaje">
                    <div>
                      {/* Campo para seleccionar la fecha del patrullaje */}
                      <div className="campo-fecha-patrullaje">
                        <IonLabel className="label-fecha-patrullaje">Fecha:</IonLabel>
                        <IonInput
                          type="date"
                          className="input-fecha-patrullaje"
                          value={fecha}
                          onIonInput={(e) => setFecha(e.detail.value || '')}
                        />
                      </div>

                      {/* Componente FormularioPatrullaje */}
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
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="acciones-patrullaje-container">
                      <IonButton
                        expand="block"
                        className="btn-registrar-submit"
                        onClick={handleRegistrarPatrullaje}
                        disabled={guardando}
                      >
                        {guardando ? 'Registrando...' : 'Registrar'}
                      </IonButton>

                      <IonButton
                        expand="block"
                        fill="clear"
                        className="btn-cancelar-patrullaje"
                        onClick={() =>
                          router.push(
                            `/${rolRuta}/proyecto/${id_proyecto}/cronograma`,
                            'back'
                          )
                        }
                      >
                        Cancelar
                      </IonButton>
                    </div>
                  </div>
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default AgregarPatrullaje;
