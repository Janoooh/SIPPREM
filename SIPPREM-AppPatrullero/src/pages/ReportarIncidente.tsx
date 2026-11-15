import React, { useEffect, useRef, useState } from 'react';
import {
  IonContent,
  IonIcon,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  useIonRouter,
  useIonToast
} from '@ionic/react';
import {
  arrowBackOutline,
  cloudUploadOutline,
  closeOutline,
  locationOutline,
  paperPlaneOutline
} from 'ionicons/icons';
import { useLocation, useParams } from 'react-router-dom';
import { Geolocation } from '@capacitor/geolocation';
import { isAxiosError } from 'axios';
import BarraNavInferior from '../components/barraNavInferior';
import { useSeguimientoGlobal } from '../context/seguimientoContext';
import { usuarioService } from '../services/UsuarioService';
import {
  CATEGORIAS_INCIDENTE,
  NIVELES_GRAVEDAD,
  formatearPuntoWKT,
  incidentesService
} from '../services/incidentesService';
import './ReportarIncidente.css';

const MAX_FOTOGRAFIAS = 4;
const MAX_CARACTERES_OBSERVACIONES = 255;

interface CoordenadasIncidente {
  latitud: number;
  longitud: number;
}

interface PatrullajeResumen {
  id_patrullaje: number;
  id_proyecto: number;
  nombre_proyecto?: string;
  estado?: string;
}

/**
 * Redimensiona y comprime una imagen a Base64 JPEG para optimizar el envío desde dispositivos móviles.
 */
const convertirArchivoABase64Optimizado = (archivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    lector.onload = () => {
      const resultadoOriginal = typeof lector.result === 'string' ? lector.result : '';
      if (!resultadoOriginal) {
        reject(new Error('El archivo seleccionado está vacío.'));
        return;
      }

      const imagen = new Image();
      imagen.onerror = () => {
        // Si el navegador no puede decodificar en canvas, enviamos el Base64 original
        resolve(resultadoOriginal);
      };
      imagen.onload = () => {
        const maxDimension = 1280;
        let ancho = imagen.width;
        let alto = imagen.height;

        if (ancho > maxDimension || alto > maxDimension) {
          if (ancho >= alto) {
            alto = Math.round((alto * maxDimension) / ancho);
            ancho = maxDimension;
          } else {
            ancho = Math.round((ancho * maxDimension) / alto);
            alto = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = ancho;
        canvas.height = alto;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(resultadoOriginal);
          return;
        }

        ctx.drawImage(imagen, 0, 0, ancho, alto);
        const comprimida = canvas.toDataURL('image/jpeg', 0.78);
        resolve(comprimida);
      };
      imagen.src = resultadoOriginal;
    };
    lector.readAsDataURL(archivo);
  });
};

const ReportarIncidente: React.FC = () => {
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const location = useLocation();
  const router = useIonRouter();
  const [mandarToast] = useIonToast();
  const inputArchivoRef = useRef<HTMLInputElement | null>(null);

  const idPatrullajeQuery = new URLSearchParams(location.search).get('id_patrullaje');

  const { ubicacion: ubicacionGlobal, patrullajeEnCurso } = useSeguimientoGlobal();
  const seguimientoActivo = Boolean(patrullajeEnCurso);

  const [idPatrullajeResuelto, setIdPatrullajeResuelto] = useState<number | null>(
    idPatrullajeQuery
      ? Number(idPatrullajeQuery)
      : patrullajeEnCurso?.id_patrullaje
        ? Number(patrullajeEnCurso.id_patrullaje)
        : null
  );
  const [nombreProyecto, setNombreProyecto] = useState<string>(
    patrullajeEnCurso?.nombre_proyecto || ''
  );
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [nivelGravedad, setNivelGravedad] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState<string>('');
  const [fotografias, setFotografias] = useState<string[]>([]);
  const [procesandoFotos, setProcesandoFotos] = useState<boolean>(false);
  const [enviandoReporte, setEnviandoReporte] = useState<boolean>(false);
  const [coordenadasLocales, setCoordenadasLocales] = useState<CoordenadasIncidente | null>(null);
  const [obteniendoGpsManual, setObteniendoGpsManual] = useState<boolean>(false);

  const coordenadasActuales: CoordenadasIncidente | null = ubicacionGlobal
    ? { latitud: ubicacionGlobal.latitud, longitud: ubicacionGlobal.longitud }
    : coordenadasLocales;

  const gravedadSeleccionada = NIVELES_GRAVEDAD.find((item) => item.valor === nivelGravedad) || null;

  // Resolver datos del patrullaje activo si no vienen completos por URL
  useEffect(() => {
    let cancelado = false;

    const cargarContextoPatrullaje = async () => {
      try {
        const lista = await usuarioService.obtenerPatrullajesUsuario();
        if (cancelado || !Array.isArray(lista)) return;

        const listaTipada: PatrullajeResumen[] = lista;
        const encontrado = listaTipada.find((p) => {
          if (idPatrullajeQuery) {
            return String(p.id_patrullaje) === String(idPatrullajeQuery);
          }
          return (
            String(p.id_proyecto) === String(id_proyecto) &&
            (p.estado || '').trim().toLowerCase() === 'en curso'
          );
        }) || listaTipada.find((p) => String(p.id_proyecto) === String(id_proyecto));

        if (encontrado) {
          if (!idPatrullajeQuery && encontrado.id_patrullaje) {
            setIdPatrullajeResuelto(Number(encontrado.id_patrullaje));
          }
          if (encontrado.nombre_proyecto) {
            setNombreProyecto(encontrado.nombre_proyecto);
          }
        }
      } catch {
        // Si falla la consulta auxiliar, conservamos los parámetros de la ruta
      }
    };

    void cargarContextoPatrullaje();

    return () => {
      cancelado = true;
    };
  }, [id_proyecto, idPatrullajeQuery]);

  // Obtener ubicación puntual si el seguimiento global aún no tiene lectura
  const solicitarUbicacionPuntual = async (mostrarAviso = false): Promise<CoordenadasIncidente | null> => {
    setObteniendoGpsManual(true);
    try {
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      });
      const nuevasCoords: CoordenadasIncidente = {
        latitud: pos.coords.latitude,
        longitud: pos.coords.longitude
      };
      setCoordenadasLocales(nuevasCoords);
      return nuevasCoords;
    } catch {
      if (mostrarAviso) {
        mandarToast({
          message: 'No se pudo obtener la ubicación GPS. Verifica que el GPS esté encendido.',
          duration: 2800,
          position: 'bottom',
          color: 'warning'
        });
      }
      return null;
    } finally {
      setObteniendoGpsManual(false);
    }
  };

  useEffect(() => {
    if (!ubicacionGlobal && !coordenadasLocales) {
      solicitarUbicacionPuntual(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ubicacionGlobal]);

  const volverAPatrullajeActivo = () => {
    const queryPatrullaje = idPatrullajeResuelto ? `?id_patrullaje=${idPatrullajeResuelto}` : '';
    router.push(
      `/patrullero/proyecto/${id_proyecto}/patrullaje-activo${queryPatrullaje}`,
      'back'
    );
  };

  const handleAbrirSelectorFotos = () => {
    if (fotografias.length >= MAX_FOTOGRAFIAS) {
      mandarToast({
        message: `Puedes adjuntar un máximo de ${MAX_FOTOGRAFIAS} fotografías por incidente.`,
        duration: 2500,
        position: 'bottom',
        color: 'warning'
      });
      return;
    }
    inputArchivoRef.current?.click();
  };

  const handleSeleccionarArchivos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const listaArchivos = event.target.files;
    if (!listaArchivos || listaArchivos.length === 0) return;

    const cupoDisponible = MAX_FOTOGRAFIAS - fotografias.length;
    const archivosAProcesar = Array.from(listaArchivos).slice(0, cupoDisponible);

    if (listaArchivos.length > cupoDisponible) {
      mandarToast({
        message: `Solo se agregaron ${cupoDisponible} foto(s) hasta completar el máximo de ${MAX_FOTOGRAFIAS}.`,
        duration: 2500,
        position: 'bottom',
        color: 'warning'
      });
    }

    setProcesandoFotos(true);
    try {
      const nuevasBase64: string[] = [];
      for (const archivo of archivosAProcesar) {
        if (!archivo.type.startsWith('image/')) continue;
        const base64 = await convertirArchivoABase64Optimizado(archivo);
        nuevasBase64.push(base64);
      }

      if (nuevasBase64.length > 0) {
        setFotografias((prev) => [...prev, ...nuevasBase64]);
      }
    } catch {
      mandarToast({
        message: 'Ocurrió un problema al procesar la fotografía seleccionada.',
        duration: 2500,
        position: 'bottom',
        color: 'danger'
      });
    } finally {
      setProcesandoFotos(false);
      if (inputArchivoRef.current) {
        inputArchivoRef.current.value = '';
      }
    }
  };

  const handleEliminarFotografia = (indice: number) => {
    setFotografias((prev) => prev.filter((_, idx) => idx !== indice));
  };

  const handleEnviarIncidente = async () => {
    if (!id_proyecto || Number.isNaN(Number(id_proyecto))) {
      mandarToast({
        message: 'No se encontró un proyecto válido para asociar el incidente.',
        duration: 2600,
        position: 'bottom',
        color: 'danger'
      });
      return;
    }

    if (!idPatrullajeResuelto || Number.isNaN(Number(idPatrullajeResuelto))) {
      mandarToast({
        message: 'No se encontró un patrullaje activo asociado.',
        duration: 2600,
        position: 'bottom',
        color: 'danger'
      });
      return;
    }

    if (!idCategoria) {
      mandarToast({
        message: 'Por favor selecciona la categoría del incidente.',
        duration: 2300,
        position: 'bottom',
        color: 'warning'
      });
      return;
    }

    if (!nivelGravedad) {
      mandarToast({
        message: 'Por favor selecciona el nivel de gravedad.',
        duration: 2300,
        position: 'bottom',
        color: 'warning'
      });
      return;
    }

    const observacionesLimpias = observaciones.trim();
    if (!observacionesLimpias) {
      mandarToast({
        message: 'Por favor ingresa las observaciones del incidente.',
        duration: 2300,
        position: 'bottom',
        color: 'warning'
      });
      return;
    }

    setEnviandoReporte(true);
    try {
      let coordsParaEnvio = coordenadasActuales;
      if (!coordsParaEnvio) {
        coordsParaEnvio = await solicitarUbicacionPuntual(true);
      }

      if (!coordsParaEnvio) {
        setEnviandoReporte(false);
        return;
      }

      const ubicacionWKT = formatearPuntoWKT(coordsParaEnvio.latitud, coordsParaEnvio.longitud);

      await incidentesService.crearIncidente(Number(id_proyecto), {
        id_patrullaje: Number(idPatrullajeResuelto),
        id_categoria_incidente: idCategoria,
        nivel_gravedad: nivelGravedad,
        observaciones: observacionesLimpias,
        ubicacion: ubicacionWKT,
        fotografias: fotografias.length > 0 ? fotografias : undefined
      });

      mandarToast({
        message: 'Incidente reportado exitosamente.',
        duration: 2400,
        position: 'bottom',
        color: 'success'
      });

      volverAPatrullajeActivo();
    } catch (error: unknown) {
      let mensajeError = 'No se pudo registrar el incidente. Intenta nuevamente.';
      if (isAxiosError(error)) {
        const data = error.response?.data as { error?: string; mensaje?: string } | undefined;
        mensajeError = data?.error || data?.mensaje || mensajeError;
      }
      mandarToast({
        message: mensajeError,
        duration: 3500,
        position: 'bottom',
        color: 'danger'
      });
    } finally {
      setEnviandoReporte(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="fondo-reportar-incidente">
        <div className="contenedor-reportar-incidente">
          {/* Encabezado con botón para volver y estado GPS */}
          <div className="encabezado-reportar">
            <div className="fila-titulo-reportar">
              <button
                type="button"
                className="btn-volver-patrullaje"
                onClick={volverAPatrullajeActivo}
                aria-label="Volver al patrullaje activo"
              >
                <IonIcon icon={arrowBackOutline} />
              </button>
              <h1 className="titulo-reportar-incidente">Reportar incidente</h1>
            </div>

            <div className="barra-contexto-incidente">
              <p className="texto-proyecto-contexto">
                {nombreProyecto ? `Sector: ${nombreProyecto}` : `Proyecto #${id_proyecto}`}
              </p>

              {coordenadasActuales ? (
                <span className="badge-gps-estado gps-listo">
                  <IonIcon icon={locationOutline} />
                  {seguimientoActivo ? 'GPS en vivo listo' : 'Ubicación capturada'}
                </span>
              ) : (
                <button
                  type="button"
                  className="badge-gps-estado gps-buscando"
                  onClick={() => solicitarUbicacionPuntual(true)}
                >
                  <IonIcon icon={locationOutline} />
                  {obteniendoGpsManual ? 'Obteniendo GPS...' : 'Reintentar GPS'}
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta principal que respeta la estructura y orden del wireframe */}
          <div className="tarjeta-formulario-incidente">
            {/* 1. Categoría del incidente */}
            <div className="bloque-campo-incidente">
              <IonLabel className="etiqueta-campo-incidente">
                Categoría del incidente:
              </IonLabel>
              <div className="caja-select-incidente">
                <IonSelect
                  value={idCategoria}
                  placeholder="Seleccionar categoría..."
                  onIonChange={(e) => setIdCategoria(Number(e.detail.value))}
                  interface="action-sheet"
                  cancelText="Cancelar"
                  className="select-incidente-custom"
                >
                  {CATEGORIAS_INCIDENTE.map((cat) => (
                    <IonSelectOption
                      key={cat.id_categoria_incidente}
                      value={cat.id_categoria_incidente}
                    >
                      {cat.categoria}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>

            {/* 2. Botón Subir fotografía + Galería de previsualización */}
            <div className="seccion-subir-foto">
              <input
                ref={inputArchivoRef}
                type="file"
                accept="image/*"
                multiple
                className="input-archivo-oculto"
                onChange={handleSeleccionarArchivos}
              />

              <button
                type="button"
                className="btn-subir-fotografia"
                onClick={handleAbrirSelectorFotos}
                disabled={procesandoFotos || fotografias.length >= MAX_FOTOGRAFIAS}
              >
                <span>
                  {procesandoFotos ? 'Procesando imagen...' : 'Subir fotografía'}
                </span>
                {procesandoFotos ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <IonIcon icon={cloudUploadOutline} className="icono-subir-foto" />
                )}
              </button>

              <p className="Subtexto-fotos">
                Opcional ({fotografias.length}/{MAX_FOTOGRAFIAS} fotografías adjuntas)
              </p>

              {fotografias.length > 0 && (
                <div className="galeria-previsualizacion-fotos">
                  {fotografias.map((fotoBase64, index) => (
                    <div key={index} className="item-foto-preview">
                      <img
                        src={fotoBase64}
                        alt={`Evidencia ${index + 1}`}
                        className="img-foto-preview"
                      />
                      <button
                        type="button"
                        className="btn-eliminar-foto"
                        onClick={() => handleEliminarFotografia(index)}
                        aria-label={`Eliminar fotografía ${index + 1}`}
                      >
                        <IonIcon icon={closeOutline} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Gravedad (fila horizontal como en el wireframe) */}
            <div className="bloque-gravedad-contenedor">
              <div className="fila-gravedad-inline">
                <IonLabel className="etiqueta-gravedad-inline">
                  Gravedad:
                </IonLabel>
                <div className="caja-select-gravedad">
                  <IonSelect
                    value={nivelGravedad}
                    placeholder="Nivel (1 a 5)"
                    onIonChange={(e) => setNivelGravedad(Number(e.detail.value))}
                    interface="popover"
                    className="select-incidente-custom"
                  >
                    {NIVELES_GRAVEDAD.map((nivel) => (
                      <IonSelectOption key={nivel.valor} value={nivel.valor}>
                        {nivel.etiqueta}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>
              </div>

              {gravedadSeleccionada && (
                <div className="indicador-gravedad-detalle">
                  <span
                    className="punto-color-gravedad"
                    style={{ backgroundColor: gravedadSeleccionada.color }}
                  />
                  <span>{gravedadSeleccionada.descripcion}</span>
                </div>
              )}
            </div>

            {/* 4. Observaciones */}
            <div className="bloque-campo-incidente">
              <div className="cabecera-observaciones">
                <IonLabel className="etiqueta-campo-incidente">
                  Observaciones
                </IonLabel>
                <span
                  className={`contador-caracteres ${
                    observaciones.length >= 230 ? 'limite-cerca' : ''
                  }`}
                >
                  {observaciones.length}/{MAX_CARACTERES_OBSERVACIONES}
                </span>
              </div>

              <div className="caja-textarea-observaciones">
                <textarea
                  className="textarea-observaciones-input"
                  placeholder="Describe brevemente lo ocurrido, referencias del lugar o detalles relevantes..."
                  maxLength={MAX_CARACTERES_OBSERVACIONES}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                />
              </div>
            </div>

            {/* 5. Botón inferior Reportar incidente */}
            <div className="contenedor-boton-enviar-incidente">
              <button
                type="button"
                className="btn-enviar-incidente"
                onClick={handleEnviarIncidente}
                disabled={enviandoReporte || procesandoFotos}
              >
                {enviandoReporte ? (
                  <>
                    <IonSpinner name="crescent" />
                    <span>Reportando...</span>
                  </>
                ) : (
                  <>
                    <span>Reportar incidente</span>
                    <IonIcon icon={paperPlaneOutline} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </IonContent>

      <BarraNavInferior id_proyecto={id_proyecto} />
    </IonPage>
  );
};

export default ReportarIncidente;
