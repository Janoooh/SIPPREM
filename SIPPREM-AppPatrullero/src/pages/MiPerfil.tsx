import React, { useState } from 'react';
import {
  IonAvatar,
  IonContent,
  IonIcon,
  IonImg,
  IonPage,
  IonSpinner,
  useIonAlert,
  useIonRouter,
  useIonViewWillEnter
} from '@ionic/react';
import {
  calendarOutline,
  callOutline,
  idCardOutline,
  logOutOutline,
  mailOutline
} from 'ionicons/icons';
import { useParams } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import { isAxiosError } from 'axios';
import BarraNavInferior from '../components/barraNavInferior';
import { EVENTO_SESION_PATRULLERO } from '../context/seguimientoContext';
import { UsuarioPerfil, usuarioService } from '../services/UsuarioService';
import './MiPerfil.css';

const formatearFecha = (fechaIso?: string): string => {
  if (!fechaIso) return 'No disponible';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'No disponible';
  return fecha.toLocaleDateString('es-CL');
};

const MiPerfil: React.FC = () => {
  const { id_proyecto } = useParams<{ id_proyecto?: string }>();
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useIonViewWillEnter(() => {
    const cargarMiPerfil = async () => {
      try {
        setCargando(true);
        const datos = await usuarioService.obtenerMiPerfil();
        setPerfil(datos);
      } catch (error: unknown) {
        let mensajeError = 'No fue posible obtener la información del usuario.';
        if (isAxiosError(error)) {
          const data = error.response?.data as { message?: string; explicacion?: string } | undefined;
          mensajeError = data?.message || data?.explicacion || mensajeError;
        }
        mandarAlerta({
          header: 'Error al cargar perfil',
          message: mensajeError,
          buttons: ['Aceptar']
        });
      } finally {
        setCargando(false);
      }
    };

    void cargarMiPerfil();
  });

  const handleCerrarSesion = () => {
    mandarAlerta({
      header: 'Cerrar sesión',
      message: '¿Deseas cerrar tu sesión actual?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await Preferences.remove({ key: 'token' });
            await Preferences.remove({ key: 'usuario' });
            window.dispatchEvent(new Event(EVENTO_SESION_PATRULLERO));
            router.push('/login', 'root', 'replace');
          }
        }
      ]
    });
  };

  return (
    <IonPage>
      <IonContent fullscreen className="mi-perfil-content">
        <div className="mi-perfil-container">
          <div className="mi-perfil-logo-box">
            <IonImg
              src="/assets/logoSIPPREM.png"
              alt="SIPPREM Logo"
              className="mi-perfil-logo"
            />
          </div>

          <div className="mi-perfil-card">
            {cargando ? (
              <div className="mi-perfil-loading">
                <IonSpinner name="crescent" color="light" />
                <span>Cargando información del perfil...</span>
              </div>
            ) : perfil ? (
              <>
                <IonAvatar className="mi-perfil-avatar">
                  <IonImg
                    src={perfil.foto || '/assets/fotoPerfil.png'}
                    alt={perfil.nombre}
                    className="mi-perfil-avatar-img"
                  />
                </IonAvatar>

                <div className="mi-perfil-cabecera-identidad">
                  <h1 className="mi-perfil-nombre">{perfil.nombre}</h1>
                  <span className="mi-perfil-rol-badge">
                    {perfil.tipo_rol ? perfil.tipo_rol.toUpperCase() : 'SIN ROL'}
                  </span>
                </div>

                <div className="mi-perfil-datos-lista">
                  <div className="mi-perfil-dato-item">
                    <IonIcon icon={idCardOutline} className="mi-perfil-dato-icono" />
                    <div className="mi-perfil-dato-contenido">
                      <span className="mi-perfil-dato-etiqueta">RUT</span>
                      <p className="mi-perfil-dato-valor">{perfil.rut}</p>
                    </div>
                  </div>

                  <div className="mi-perfil-dato-item">
                    <IonIcon icon={mailOutline} className="mi-perfil-dato-icono" />
                    <div className="mi-perfil-dato-contenido">
                      <span className="mi-perfil-dato-etiqueta">Correo</span>
                      <p className="mi-perfil-dato-valor">{perfil.correo}</p>
                    </div>
                  </div>

                  <div className="mi-perfil-dato-item">
                    <IonIcon icon={callOutline} className="mi-perfil-dato-icono" />
                    <div className="mi-perfil-dato-contenido">
                      <span className="mi-perfil-dato-etiqueta">Teléfono</span>
                      <p className="mi-perfil-dato-valor">
                        {perfil.telefono || 'No registrado'}
                      </p>
                    </div>
                  </div>

                  <div className="mi-perfil-dato-item">
                    <IonIcon icon={calendarOutline} className="mi-perfil-dato-icono" />
                    <div className="mi-perfil-dato-contenido">
                      <span className="mi-perfil-dato-etiqueta">Fecha de registro</span>
                      <p className="mi-perfil-dato-valor">
                        {formatearFecha(perfil.fecha_registro)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mi-perfil-acciones">
                  <button
                    type="button"
                    className="btn-cerrar-sesion-perfil"
                    onClick={handleCerrarSesion}
                  >
                    <IonIcon icon={logOutOutline} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="mi-perfil-loading">
                <span>No se pudo cargar la información del perfil.</span>
              </div>
            )}
          </div>
        </div>
      </IonContent>

      <BarraNavInferior id_proyecto={id_proyecto} />
    </IonPage>
  );
};

export default MiPerfil;
