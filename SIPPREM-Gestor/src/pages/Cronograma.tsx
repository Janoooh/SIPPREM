import React, { useState, useEffect, useMemo } from 'react';
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
  useIonRouter,
  useIonViewWillEnter
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import { useUsuario } from '../hooks/obtenerUsuario';
import { actividadesService } from '../services/actividadesService';
import { patrullajesService, PatrullajeProyecto } from '../services/patrullajesService';
import { ActividadFutura } from '../interfaces/actividadFutura';
import './Cronograma.css';

// Nombres de los meses y días de la semana para el calendario
const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado'
];

interface CeldaCalendario {
  fechaClave: string; // Formato YYYY-MM-DD
  dia: number;
  mes: number;
  anio: number;
  esMesActual: boolean;
}

const Cronograma: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  // Estados de datos traídos desde el backend
  const [actividades, setActividades] = useState<ActividadFutura[]>([]);
  const [patrullajes, setPatrullajes] = useState<PatrullajeProyecto[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // Estado del mes/año visible en el calendario y del día seleccionado (YYYY-MM-DD)
  const fechaInicial = new Date();
  const [anioActual, setAnioActual] = useState<number>(fechaInicial.getFullYear());
  const [mesActual, setMesActual] = useState<number>(fechaInicial.getMonth());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(() => {
    const y = fechaInicial.getFullYear();
    const m = String(fechaInicial.getMonth() + 1).padStart(2, '0');
    const d = String(fechaInicial.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });

  // Función auxiliar para normalizar una fecha ISO/Date a clave YYYY-MM-DD
  const obtenerClaveFecha = (valor?: string | Date): string => {
    if (!valor) return '';
    if (typeof valor === 'string') {
      const parteFecha = valor.split('T')[0].split(' ')[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(parteFecha)) {
        return parteFecha;
      }
    }
    const d = new Date(valor);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Carga las actividades y los patrullajes del proyecto desde el backend
  const cargarDatosCronograma = async () => {
    if (!id_proyecto) return;
    try {
      setCargando(true);
      const [listaActividades, listaPatrullajes] = await Promise.all([
        actividadesService.obtenerActividadesProyecto(String(id_proyecto)).catch(() => []),
        patrullajesService.obtenerPatrullajesProyecto(String(id_proyecto)).catch(() => [])
      ]);

      setActividades(listaActividades || []);
      setPatrullajes(listaPatrullajes || []);

      // Si el mes actual no tiene eventos pero el proyecto sí registra eventos en otro mes,
      // posicionamos inicialmente el calendario en el primer evento para facilitar la visualización.
      const todasLasFechas = [
        ...(listaPatrullajes || []).map((p) => obtenerClaveFecha(p.hora_inicio)),
        ...(listaActividades || []).map((a) => obtenerClaveFecha(a.fecha || a.fechaHoraInicio))
      ]
        .filter(Boolean)
        .sort();

      if (todasLasFechas.length > 0) {
        const prefijoMesActual = `${anioActual}-${String(mesActual + 1).padStart(2, '0')}`;
        const hayEnMesActual = todasLasFechas.some((f) => f.startsWith(prefijoMesActual));
        if (!hayEnMesActual) {
          const primeraFecha = todasLasFechas[0];
          const [y, m] = primeraFecha.split('-').map(Number);
          if (y && m) {
            setAnioActual(y);
            setMesActual(m - 1);
            setFechaSeleccionada(primeraFecha);
          }
        }
      }
    } catch (error: any) {
      console.error('Error al cargar el cronograma del proyecto:', error);
      mandarAlerta({
        header: 'Error',
        message: 'No fue posible cargar los datos del cronograma.',
        buttons: ['Aceptar']
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosCronograma();
  }, [id_proyecto]);

  useIonViewWillEnter(() => {
    cargarDatosCronograma();
  });

  // Navegación entre meses (Mes anterior y Mes siguiente)
  const irMesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual((prev) => prev - 1);
    } else {
      setMesActual((prev) => prev - 1);
    }
  };

  const irMesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual((prev) => prev + 1);
    } else {
      setMesActual((prev) => prev + 1);
    }
  };

  // Construcción de las 42 celdas (6 semanas x 7 días) del mes visualizado
  const celdasCalendario: CeldaCalendario[] = useMemo(() => {
    const primerDiaSemana = new Date(anioActual, mesActual, 1).getDay(); // 0 (Dom) a 6 (Sáb)
    const totalDiasMesActual = new Date(anioActual, mesActual + 1, 0).getDate();
    const totalDiasMesAnterior = new Date(anioActual, mesActual, 0).getDate();

    const celdas: CeldaCalendario[] = [];

    const armarClave = (anio: number, mesIdx: number, dia: number) => {
      const fechaReal = new Date(anio, mesIdx, dia);
      const y = fechaReal.getFullYear();
      const m = String(fechaReal.getMonth() + 1).padStart(2, '0');
      const d = String(fechaReal.getDate()).padStart(2, '0');
      return {
        fechaClave: `${y}-${m}-${d}`,
        dia: fechaReal.getDate(),
        mes: fechaReal.getMonth(),
        anio: fechaReal.getFullYear()
      };
    };

    // Días finales del mes anterior para completar la primera semana
    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const diaAnt = totalDiasMesAnterior - i;
      celdas.push({
        ...armarClave(anioActual, mesActual - 1, diaAnt),
        esMesActual: false
      });
    }

    // Días del mes actual
    for (let dia = 1; dia <= totalDiasMesActual; dia++) {
      celdas.push({
        ...armarClave(anioActual, mesActual, dia),
        esMesActual: true
      });
    }

    // Días iniciales del mes siguiente hasta completar 42 celdas (6 filas)
    const restantes = 42 - celdas.length;
    for (let diaSig = 1; diaSig <= restantes; diaSig++) {
      celdas.push({
        ...armarClave(anioActual, mesActual + 1, diaSig),
        esMesActual: false
      });
    }

    return celdas;
  }, [anioActual, mesActual]);

  // Agrupación de patrullajes y actividades por fecha (YYYY-MM-DD) para acceso rápido
  const eventosPorFecha = useMemo(() => {
    const mapa: Record<
      string,
      { patrullajes: PatrullajeProyecto[]; actividades: ActividadFutura[] }
    > = {};

    patrullajes.forEach((p) => {
      const clave = obtenerClaveFecha(p.hora_inicio);
      if (!clave) return;
      if (!mapa[clave]) mapa[clave] = { patrullajes: [], actividades: [] };
      mapa[clave].patrullajes.push(p);
    });

    actividades.forEach((a) => {
      if (a.eliminado) return;
      const clave = obtenerClaveFecha(a.fecha || a.fechaHoraInicio);
      if (!clave) return;
      if (!mapa[clave]) mapa[clave] = { patrullajes: [], actividades: [] };
      mapa[clave].actividades.push(a);
    });

    return mapa;
  }, [patrullajes, actividades]);

  // Al hacer clic en un día del calendario
  const handleSeleccionarDia = (celda: CeldaCalendario) => {
    setFechaSeleccionada(celda.fechaClave);
    if (!celda.esMesActual) {
      setAnioActual(celda.anio);
      setMesActual(celda.mes);
    }
  };

  // Formateo legible del día seleccionado para el encabezado del bloque lateral (ej: "15 DE JUNIO")
  const textoDiaSeleccionado = useMemo(() => {
    if (!fechaSeleccionada) return 'DÍA DE MES';
    const partes = fechaSeleccionada.split('-').map(Number);
    if (partes.length !== 3) return fechaSeleccionada;
    const [anio, mes, dia] = partes;
    const nombreMes = NOMBRES_MESES[mes - 1] || '';
    return `${dia} DE ${nombreMes.toUpperCase()} (${anio})`;
  }, [fechaSeleccionada]);

  // Formateo de hora HH:MM para los patrullajes
  const formatearHora = (fechaHoraStr?: string) => {
    if (!fechaHoraStr) return '--:--';
    const d = new Date(fechaHoraStr);
    if (isNaN(d.getTime())) return '--:--';
    return d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Eventos correspondientes al día actualmente seleccionado
  const eventosDiaSeleccionado = eventosPorFecha[fechaSeleccionada] || {
    patrullajes: [],
    actividades: []
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#4a5e73' } as React.CSSProperties}>
        <IonGrid className="cronograma-grid ion-padding">
          <IonRow>
            {/* Columna izquierda: Menú lateral de opciones del proyecto */}
            <IonCol size="12" sizeLg="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="cronograma"
              />
            </IonCol>

            {/* Columna central y derecha: Calendario y Bloque lateral del día seleccionado */}
            <IonCol size="12" sizeLg="9" className="cronograma-contenido-col">
              {cargando ? (
                <IonRow className="ion-justify-content-center ion-margin-top">
                  <IonSpinner name="crescent" color="light" />
                </IonRow>
              ) : (
                <IonRow>
                  {/* Bloque del Calendario Navegable */}
                  <IonCol size="12" sizeXl="8" sizeLg="8">
                    <div className="calendario-top-bar">
                      {/* Leyenda de colores: Patrullaje (Azul) y Actividad (Verde) */}
                      <div className="leyenda-calendario">
                        <span className="leyenda-item leyenda-patrullaje">
                          <span className="punto-leyenda punto-azul" />
                          Patrullaje
                        </span>
                        <span className="leyenda-item leyenda-actividad">
                          <span className="punto-leyenda punto-verde" />
                          Actividad
                        </span>
                      </div>

                      {/* Navegación entre meses */}
                      <div className="navegacion-mes">
                        <IonButton
                          fill="clear"
                          size="small"
                          className="btn-nav-mes"
                          onClick={irMesAnterior}
                          title="Mes anterior"
                        >
                          <IonIcon slot="icon-only" icon={chevronBackOutline} />
                        </IonButton>

                        <span className="titulo-mes-anio">
                          {NOMBRES_MESES[mesActual]} {anioActual}
                        </span>

                        <IonButton
                          fill="clear"
                          size="small"
                          className="btn-nav-mes"
                          onClick={irMesSiguiente}
                          title="Mes siguiente"
                        >
                          <IonIcon slot="icon-only" icon={chevronForwardOutline} />
                        </IonButton>
                      </div>
                    </div>

                    {/* Grilla de días del mes */}
                    <div className="calendario-wrapper">
                      <div className="calendario-dias-semana">
                        {DIAS_SEMANA.map((diaNombre) => (
                          <div key={diaNombre} className="dia-semana-header">
                            {diaNombre}
                          </div>
                        ))}
                      </div>

                      <div className="calendario-grilla">
                        {celdasCalendario.map((celda) => {
                          const eventosCelda = eventosPorFecha[celda.fechaClave];
                          const cantPatrullajes = eventosCelda?.patrullajes.length || 0;
                          const cantActividades = eventosCelda?.actividades.length || 0;
                          const estaSeleccionada = celda.fechaClave === fechaSeleccionada;

                          return (
                            <div
                              key={celda.fechaClave}
                              className={`celda-dia ${
                                !celda.esMesActual ? 'celda-otro-mes' : ''
                              } ${estaSeleccionada ? 'celda-dia-seleccionada' : ''}`}
                              onClick={() => handleSeleccionarDia(celda)}
                            >
                              <span className="numero-dia">{celda.dia}</span>

                              {/* Puntos indicadores: Azul para patrullajes y Verde para actividades */}
                              <div className="puntos-eventos-dia">
                                {Array.from({ length: cantPatrullajes }).map((_, idx) => (
                                  <span
                                    key={`pat-${celda.fechaClave}-${idx}`}
                                    className="punto-evento punto-azul"
                                    title="Patrullaje programado"
                                  />
                                ))}
                                {Array.from({ length: cantActividades }).map((_, idx) => (
                                  <span
                                    key={`act-${celda.fechaClave}-${idx}`}
                                    className="punto-evento punto-verde"
                                    title="Actividad programada"
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </IonCol>

                  {/* Bloque lateral derecho: Día seleccionado, detalle de eventos y botones */}
                  <IonCol size="12" sizeXl="4" sizeLg="4">
                    <div className="panel-lateral-dia">
                      <div>
                        <IonLabel className="titulo-dia-seleccionado">
                          {textoDiaSeleccionado}
                        </IonLabel>

                        {/* Lista con el detalle de qué patrullaje o actividad hay en el día seleccionado */}
                        <div className="detalle-eventos-dia">
                          {eventosDiaSeleccionado.patrullajes.length === 0 &&
                          eventosDiaSeleccionado.actividades.length === 0 ? (
                            <p className="sin-eventos-texto">
                              No hay patrullajes ni actividades registradas para este día.
                            </p>
                          ) : (
                            <>
                              {/* Detalle de Patrullajes del día (Azul) */}
                              {eventosDiaSeleccionado.patrullajes.map((pat) => (
                                <div
                                  key={`det-pat-${pat.id_patrullaje}`}
                                  className="tarjeta-evento-dia tarjeta-patrullaje"
                                >
                                  <div className="evento-header">
                                    <span className="evento-tipo-badge badge-patrullaje">
                                      ● Patrullaje #{pat.id_patrullaje}
                                    </span>
                                    <span className="evento-hora-estado">{pat.estado}</span>
                                  </div>
                                  <p className="evento-titulo">
                                    Horario: {formatearHora(pat.hora_inicio)} -{' '}
                                    {formatearHora(pat.hora_termino)}
                                  </p>
                                  {pat.patrulleros && pat.patrulleros.length > 0 && (
                                    <p className="evento-subtexto">
                                      Patrulleros:{' '}
                                      {pat.patrulleros.map((u) => u.nombre).join(', ')}
                                    </p>
                                  )}
                                </div>
                              ))}

                              {/* Detalle de Actividades del día (Verde) */}
                              {eventosDiaSeleccionado.actividades.map((act, index) => (
                                <div
                                  key={`det-act-${act.id_actividad ?? index}`}
                                  className="tarjeta-evento-dia tarjeta-actividad"
                                >
                                  <div className="evento-header">
                                    <span className="evento-tipo-badge badge-actividad">
                                      ● Actividad
                                    </span>
                                  </div>
                                  <p className="evento-titulo">
                                    {act.titulo || act.tipoActividad}
                                  </p>
                                  {act.descripcion && (
                                    <p className="evento-subtexto">{act.descripcion}</p>
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Botones para agregar patrullaje o agregar actividad */}
                      <div className="botones-acciones-dia">
                        <IonButton
                          expand="block"
                          className="btn-accion-cronograma btn-registrar-patrullaje"
                          onClick={() =>
                            router.push(
                              `/${rolRuta}/proyecto/${id_proyecto}/cronograma/registrar-patrullaje?fecha=${fechaSeleccionada}`,
                              'forward'
                            )
                          }
                        >
                          Registrar patrullaje
                        </IonButton>

                        <IonButton
                          expand="block"
                          className="btn-accion-cronograma btn-registrar-actividad"
                          onClick={() =>
                            router.push(
                              `/${rolRuta}/proyecto/${id_proyecto}/cronograma/actividades/agregar?fecha=${fechaSeleccionada}`,
                              'forward'
                            )
                          }
                        >
                          Registrar actividad
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

export default Cronograma;
