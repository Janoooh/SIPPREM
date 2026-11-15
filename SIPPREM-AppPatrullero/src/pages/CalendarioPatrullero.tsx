import React, { useMemo, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSpinner,
  useIonAlert,
  useIonViewWillEnter
} from '@ionic/react';
import { chevronBackOutline, chevronForwardOutline } from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import BarraNavInferior from '../components/barraNavInferior';
import PatrullajeCard from '../components/PatrullajeCard';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import { usuarioService } from '../services/UsuarioService';
import './CalendarioPatrullero.css';

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

const DIAS_SEMANA_CORTOS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

interface CeldaCalendario {
  fechaClave: string;
  dia: number;
  mes: number;
  anio: number;
  esMesActual: boolean;
}

// Convierte una fecha ISO o Date al formato YYYY-MM-DD en hora local
const obtenerClaveFechaLocal = (valor: string | Date): string => {
  const fecha = typeof valor === 'string' ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return '';
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
};

const CalendarioPatrullero: React.FC = () => {
  const { id_proyecto } = useParams<{ id_proyecto?: string }>();
  const [mandarAlerta] = useIonAlert();

  const fechaInicial = useMemo(() => new Date(), []);
  const fechaHoy = useMemo(() => obtenerClaveFechaLocal(fechaInicial), [fechaInicial]);

  const [anioActual, setAnioActual] = useState<number>(fechaInicial.getFullYear());
  const [mesActual, setMesActual] = useState<number>(fechaInicial.getMonth());
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(fechaHoy);
  const [listaPatrullajes, setListaPatrullajes] = useState<PatrullajeUsuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);

  // Carga todos los patrullajes asignados al usuario al entrar a la vista
  useIonViewWillEnter(() => {
    const cargarMisPatrullajes = async () => {
      try {
        setCargando(true);
        const patrullajes = await usuarioService.obtenerPatrullajesUsuario();
        setListaPatrullajes(patrullajes || []);
      } catch (error) {
        console.error('Error al cargar el calendario de patrullajes:', error);
        mandarAlerta({
          header: 'Aviso',
          message: 'No se pudieron cargar tus patrullajes para el calendario.',
          buttons: ['Aceptar']
        });
      } finally {
        setCargando(false);
      }
    };

    void cargarMisPatrullajes();
  });

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

  const irAHoy = () => {
    const hoy = new Date();
    setAnioActual(hoy.getFullYear());
    setMesActual(hoy.getMonth());
    setFechaSeleccionada(obtenerClaveFechaLocal(hoy));
  };

  // Construcción de las 42 celdas (6 semanas x 7 días) igual al Cronograma del Gestor
  const celdasCalendario: CeldaCalendario[] = useMemo(() => {
    const primerDiaSemana = new Date(anioActual, mesActual, 1).getDay();
    const totalDiasMesActual = new Date(anioActual, mesActual + 1, 0).getDate();
    const totalDiasMesAnterior = new Date(anioActual, mesActual, 0).getDate();

    const celdas: CeldaCalendario[] = [];

    const armarCelda = (anio: number, mesIdx: number, dia: number, esMesActual: boolean): CeldaCalendario => {
      const fechaReal = new Date(anio, mesIdx, dia);
      return {
        fechaClave: obtenerClaveFechaLocal(fechaReal),
        dia: fechaReal.getDate(),
        mes: fechaReal.getMonth(),
        anio: fechaReal.getFullYear(),
        esMesActual
      };
    };

    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      celdas.push(armarCelda(anioActual, mesActual - 1, totalDiasMesAnterior - i, false));
    }

    for (let dia = 1; dia <= totalDiasMesActual; dia++) {
      celdas.push(armarCelda(anioActual, mesActual, dia, true));
    }

    const restantes = 42 - celdas.length;
    for (let diaSig = 1; diaSig <= restantes; diaSig++) {
      celdas.push(armarCelda(anioActual, mesActual + 1, diaSig, false));
    }

    return celdas;
  }, [anioActual, mesActual]);

  // Agrupa los patrullajes del usuario por fecha (YYYY-MM-DD)
  const patrullajesPorFecha = useMemo(() => {
    const mapa: Record<string, PatrullajeUsuario[]> = {};
    for (const pat of listaPatrullajes) {
      const clave = obtenerClaveFechaLocal(pat.hora_inicio);
      if (!clave) continue;
      if (!mapa[clave]) mapa[clave] = [];
      mapa[clave].push(pat);
    }
    return mapa;
  }, [listaPatrullajes]);

  const handleSeleccionarDia = (celda: CeldaCalendario) => {
    setFechaSeleccionada(celda.fechaClave);
    if (!celda.esMesActual) {
      setAnioActual(celda.anio);
      setMesActual(celda.mes);
    }
  };

  // Título legible del día seleccionado (ej: "15 DE NOVIEMBRE (2026)")
  const textoDiaSeleccionado = useMemo(() => {
    const partes = fechaSeleccionada.split('-').map(Number);
    if (partes.length !== 3) return fechaSeleccionada;
    const [anio, mes, dia] = partes;
    const nombreMes = NOMBRES_MESES[mes - 1] || '';
    return `${dia} DE ${nombreMes.toUpperCase()} (${anio})`;
  }, [fechaSeleccionada]);

  const patrullajesDelDia = patrullajesPorFecha[fechaSeleccionada] || [];

  const obtenerClasePuntoEstado = (estado?: string): string => {
    const normalizado = (estado || '').trim().toLowerCase();
    if (normalizado === 'en curso') return 'punto-verde';
    if (normalizado === 'planificado') return 'punto-azul';
    return 'punto-gris';
  };

  return (
    <IonPage>
      <IonContent fullscreen className="calendario-patrullero-content">
        <div className="calendario-patrullero-container">
          {/* Encabezado */}
          <div className="calendario-encabezado">
            <div className="calendario-titulo-bloque">
              <h1>Cronograma de Turnos</h1>
              <p>Selecciona un día para revisar tus patrullajes</p>
            </div>

            {fechaSeleccionada !== fechaHoy && (
              <button type="button" className="btn-ir-hoy" onClick={irAHoy}>
                Ir a hoy
              </button>
            )}
          </div>

          {/* Calendario con el mismo diseño visual del Gestor */}
          <div className="calendario-bloque-gestor">
            <div className="calendario-top-bar">
              <div className="fila-navegacion-mes">
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

              <div className="leyenda-calendario">
                <span className="leyenda-item leyenda-en-curso">
                  <span className="punto-leyenda punto-verde" />
                  En curso
                </span>
                <span className="leyenda-item leyenda-planificado">
                  <span className="punto-leyenda punto-azul" />
                  Planificado
                </span>
                <span className="leyenda-item leyenda-finalizado">
                  <span className="punto-leyenda punto-gris" />
                  Finalizado
                </span>
              </div>
            </div>

            <div className="calendario-wrapper">
              <div className="calendario-dias-semana">
                {DIAS_SEMANA_CORTOS.map((diaNombre) => (
                  <div key={diaNombre} className="dia-semana-header">
                    {diaNombre}
                  </div>
                ))}
              </div>

              <div className="calendario-grilla">
                {celdasCalendario.map((celda) => {
                  const turnosCelda = patrullajesPorFecha[celda.fechaClave] || [];
                  const estaSeleccionada = celda.fechaClave === fechaSeleccionada;
                  const esHoy = celda.fechaClave === fechaHoy;

                  return (
                    <div
                      key={celda.fechaClave}
                      className={`celda-dia ${
                        !celda.esMesActual ? 'celda-otro-mes' : ''
                      } ${esHoy ? 'celda-dia-hoy' : ''} ${
                        estaSeleccionada ? 'celda-dia-seleccionada' : ''
                      }`}
                      onClick={() => handleSeleccionarDia(celda)}
                    >
                      <span className="numero-dia">{celda.dia}</span>

                      <div className="puntos-eventos-dia">
                        {turnosCelda.map((pat) => (
                          <span
                            key={`pat-${celda.fechaClave}-${pat.id_patrullaje}`}
                            className={`punto-evento ${obtenerClasePuntoEstado(pat.estado)}`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tarjeta inferior de detalle del día seleccionado igual al bloque del Gestor */}
          <div className="panel-detalle-dia-gestor">
            <IonLabel className="titulo-dia-seleccionado">
              {textoDiaSeleccionado}
            </IonLabel>

            {cargando ? (
              <div className="sin-eventos-texto">
                <IonSpinner name="crescent" color="primary" />
                <p>Cargando patrullajes...</p>
              </div>
            ) : patrullajesDelDia.length === 0 ? (
              <p className="sin-eventos-texto">
                No tienes patrullajes registrados para este día.
              </p>
            ) : (
              <div className="lista-tarjetas-dia">
                {patrullajesDelDia.map((patrullaje) => (
                  <PatrullajeCard
                    key={patrullaje.id_patrullaje}
                    patrullaje={patrullaje}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </IonContent>

      <BarraNavInferior id_proyecto={id_proyecto} />
    </IonPage>
  );
};

export default CalendarioPatrullero;
