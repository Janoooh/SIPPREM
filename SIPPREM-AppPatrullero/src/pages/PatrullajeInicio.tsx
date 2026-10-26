import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonImg,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonTabBar,
  IonTabButton,
  useIonRouter,
  useIonViewWillEnter,
  useIonAlert
} from '@ionic/react';
import { homeOutline, calendarOutline, personOutline, navigateOutline } from 'ionicons/icons';
import './PatrullajeInicio.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { usuarioService } from '../services/UsuarioService';

const PatrullajeInicio: React.FC = () => {
  const { usuario } = useUsuario();
  const nombreUsuario = usuario.nombre;
  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  const [listaPatrullajes, setListaPatrullajes] = useState<any[]>([]);

  // Cargar todos los patrullajes del usuario autenticado al entrar a la vista
  useIonViewWillEnter(() => {
    const cargarPatrullajesDelUsuario = async () => {
      try {
        const patrullajes = await usuarioService.obtenerPatrullajesUsuario();
        if (patrullajes && patrullajes.length > 0) {
          setListaPatrullajes(patrullajes);
        }
      } catch (error) {
        console.error("Error al cargar los patrullajes del usuario:", error);
        mandarAlerta({
          header: 'Aviso',
          message: 'No se pudieron cargar tus patrullajes asignados.',
          buttons: ['Aceptar']
        });
      }
    };

    if (usuario) {
      cargarPatrullajesDelUsuario();
    }
  });

  const formatearHora = (fechaIso: string) => {
    if (!fechaIso) return '--:--';
    const fecha = new Date(fechaIso);
    return !isNaN(fecha.getTime()) 
      ? fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) 
      : '--:--';
  };

  return (
    <IonPage>
      {/* Contenedor principal fijo que evita desbordamientos globales */}
      <IonContent fullscreen className="patrullaje-content">
        <div className="patrullaje-container">
          
          {/* Logo superior */}
          <div className="logo-container">
            <IonImg src="/assets/logoSIPPREM.png" alt="SIPPREM Logo" className="patrullaje-logo" />
          </div>

          {/* Saludo y Nombre */}
          <div className="saludo-section">
            <h2>¡Bienvenido!</h2>
            <h1>{nombreUsuario !== 'NotData' && nombreUsuario ? nombreUsuario.toUpperCase() : 'USUARIO'}</h1>
          </div>

          {/* Título de sección */}
          <div className="seccion-titulo">
            <p>Tus Patrullajes Asignados:</p>
          </div>

          {/* CONTENEDOR CON SCROLL INTERNO (Fijo en la interfaz pero scrolleable) */}
          <div className="lista-patrullajes-scroll">
            {listaPatrullajes.length > 0 ? (
              listaPatrullajes.map((patrullaje) => (
                <IonCard className="patrullaje-card-item" key={patrullaje.id_patrullaje}>
                  <IonCardContent className="card-content-flex">
                    <div className="mapa-container">
                      <IonImg src="/assets/fotoMapa.png" alt="Zona de patrullaje" className="mapa-img" />
                    </div>
                    <div className="info-patrullaje">
                      <p className="proyecto-nombre"><strong>Proyecto:</strong> {patrullaje.nombre_proyecto}</p>
                      <p><strong>Inicio:</strong> {formatearHora(patrullaje.hora_inicio)}</p>
                      <p><strong>Término:</strong> {formatearHora(patrullaje.hora_termino)}</p>
                      
                      {/* Estado con etiqueta dinámica */}
                      <p className="estado-container">
                        <strong>Estado:</strong> 
                        <span className={`badge-estado ${patrullaje.estado.toLowerCase().replace(' ', '-')}`}>
                          {patrullaje.estado}
                        </span>
                      </p>
                    </div>
                  </IonCardContent>

                  {/* Botón de acción rápido si está planificado o en curso */}
                  {patrullaje.estado !== 'Finalizado' && (
                    <div className="ion-padding-horizontal ion-padding-bottom">
                      <IonButton 
                        expand="block" 
                        shape="round" 
                        size="small"
                        className="btn-iniciar-item"
                        onClick={() => {
                          router.push(
                            `/patrullero/proyecto/${patrullaje.id_proyecto}/preparacion?id_patrullaje=${patrullaje.id_patrullaje}`, 
                            "forward"
                          );
                        }}
                      >
  Preparar / Iniciar
</IonButton>
                    </div>
                  )}
                </IonCard>
              ))
            ) : (
              <div className="sin-patrullajes">
                <p>No tienes patrullajes asignados actualmente.</p>
              </div>
            )}
          </div>

        </div>
      </IonContent>

      {/* Barra de navegación inferior */}
      <IonTabBar slot="bottom" className="custom-tab-bar">
        <IonTabButton tab="home" href="/patrullero/inicio" className="tab-selected">
          <IonIcon icon={homeOutline} />
        </IonTabButton>
        <IonTabButton tab="calendar" href="/patrullero/calendario">
          <IonIcon icon={calendarOutline} />
        </IonTabButton>
        <IonTabButton tab="profile" href="/patrullero/perfil">
          <IonIcon icon={personOutline} />
        </IonTabButton>
      </IonTabBar>
    </IonPage>
  );
};

export default PatrullajeInicio;