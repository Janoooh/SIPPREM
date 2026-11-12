import React, { useEffect, useState } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonImg,
  IonText,
  IonLabel,
  IonList,
  IonItem,
  IonIcon,
  IonSpinner,
  useIonAlert
} from '@ionic/react';
import {
  idCardOutline,
  mailOutline,
  callOutline,
  calendarOutline
} from 'ionicons/icons';
import {
  usuariosService,
  UsuarioPerfil,
  ProyectoUsuario
} from '../services/usuariosService';
import './PerfilUsuario.css';

export interface PerfilUsuarioProps {
  /**
   * Si se entrega idUsuario, carga el detalle de ese usuario (/usuarios/:id_user y /usuarios/:id_user/proyectos).
   * Si se omite, carga el perfil del usuario autenticado (/usuarios/me).
   */
  idUsuario?: string;
  /** Callback opcional ejecutado al cerrar la alerta de error de carga. */
  onErrorVolver?: () => void;
}

const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ idUsuario, onErrorVolver }) => {
  const [mandarAlerta] = useIonAlert();

  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [proyectos, setProyectos] = useState<ProyectoUsuario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  const esDetalleOtroUsuario = Boolean(idUsuario);

  useEffect(() => {
    let activo = true;

    const cargarPerfil = async () => {
      try {
        setCargando(true);

        if (idUsuario) {
          const resUsuario = await usuariosService.obtenerUsuario(idUsuario);
          const datosUsuario: UsuarioPerfil = resUsuario.data.data;

          if (!activo) return;
          setPerfil(datosUsuario);

          // Los administradores poseen acceso total y no tienen asignaciones en acceso_proyecto
          if (datosUsuario.tipo_rol?.toLowerCase() !== 'admin') {
            const listaProyectos = await usuariosService.obtenerProyectosDeUsuario(idUsuario);
            if (!activo) return;
            setProyectos(listaProyectos);
          } else {
            setProyectos([]);
          }
        } else {
          const datosPropios = await usuariosService.obtenerMiPerfil();
          if (!activo) return;
          setPerfil(datosPropios);
          setProyectos([]);
        }
      } catch (error: any) {
        if (!activo) return;
        console.error('Error al cargar el perfil de usuario:', error);
        mandarAlerta({
          header: 'Error al cargar perfil',
          message:
            error.response?.data?.message ||
            'No fue posible obtener la información del usuario.',
          buttons: [
            {
              text: 'Aceptar',
              handler: () => {
                onErrorVolver?.();
              }
            }
          ]
        });
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarPerfil();

    return () => {
      activo = false;
    };
  }, [idUsuario]);

  const formatearFecha = (fechaIso?: string): string => {
    if (!fechaIso) return 'No disponible';
    const fecha = new Date(fechaIso);
    if (isNaN(fecha.getTime())) return 'No disponible';
    return fecha.toLocaleDateString('es-CL');
  };

  if (cargando) {
    return (
      <IonGrid className="perfil-usuario-container">
        <IonRow className="ion-justify-content-center perfil-loading-row">
          <IonSpinner name="crescent" color="light" />
        </IonRow>
      </IonGrid>
    );
  }

  if (!perfil) {
    return null;
  }

  const mostrarProyectos =
    esDetalleOtroUsuario && perfil.tipo_rol?.toLowerCase() !== 'admin';

  return (
    <IonGrid className="perfil-usuario-container">
      <IonRow className="ion-align-items-start">
        {/* Columna izquierda: Foto de perfil */}
        <IonCol size="12" sizeMd="4" className="perfil-foto-col">
          <IonAvatar className="perfil-avatar">
            <IonImg
              src={perfil.foto || '/assets/fotoPerfil.png'}
              alt={perfil.nombre}
              className="perfil-avatar-img"
            />
          </IonAvatar>
        </IonCol>

        {/* Columna derecha: Información personal y proyectos */}
        <IonCol size="12" sizeMd="8" className="perfil-info-col">
          <IonText className="perfil-nombre-rol">
            {perfil.nombre}{' '}
            <IonText className="perfil-rol-tag">
              ({perfil.tipo_rol ? perfil.tipo_rol.toUpperCase() : 'SIN ROL'})
            </IonText>
          </IonText>

          <IonGrid className="ion-no-padding perfil-datos-grid">
            <IonRow className="perfil-dato-row">
              <IonIcon icon={idCardOutline} className="perfil-dato-icono" />
              <IonText className="perfil-dato-texto">
                <IonText className="perfil-dato-etiqueta">RUT:</IonText>
                {perfil.rut}
              </IonText>
            </IonRow>

            <IonRow className="perfil-dato-row">
              <IonIcon icon={mailOutline} className="perfil-dato-icono" />
              <IonText className="perfil-dato-texto">
                <IonText className="perfil-dato-etiqueta">Correo:</IonText>
                {perfil.correo}
              </IonText>
            </IonRow>

            <IonRow className="perfil-dato-row">
              <IonIcon icon={callOutline} className="perfil-dato-icono" />
              <IonText className="perfil-dato-texto">
                <IonText className="perfil-dato-etiqueta">Teléfono:</IonText>
                {perfil.telefono || 'No registrado'}
              </IonText>
            </IonRow>

            <IonRow className="perfil-dato-row">
              <IonIcon icon={calendarOutline} className="perfil-dato-icono" />
              <IonText className="perfil-dato-texto">
                <IonText className="perfil-dato-etiqueta">Fecha de registro:</IonText>
                {formatearFecha(perfil.fecha_registro)}
              </IonText>
            </IonRow>
          </IonGrid>

          {mostrarProyectos && (
            <>
              <IonText className="perfil-proyectos-titulo">
                Proyectos donde trabaja
              </IonText>

              <IonList className="perfil-proyectos-lista" lines="full">
                {proyectos.length > 0 ? (
                  proyectos.map((proyecto) => (
                    <IonItem
                      key={proyecto.id_proyecto}
                      className="perfil-proyecto-item"
                    >
                      <IonLabel className="perfil-proyecto-nombre">
                        {proyecto.nombre_proyecto}
                      </IonLabel>
                    </IonItem>
                  ))
                ) : (
                  <IonItem className="perfil-proyecto-vacio" lines="none">
                    <IonLabel className="perfil-proyecto-vacio-texto">
                      No participa en ningún proyecto actualmente.
                    </IonLabel>
                  </IonItem>
                )}
              </IonList>
            </>
          )}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default PerfilUsuario;
