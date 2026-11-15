import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonPage,
  IonImg,
  useIonViewWillEnter,
  useIonAlert
} from '@ionic/react';
import './PatrullajeInicio.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { usuarioService } from '../services/UsuarioService';
import { PatrullajeUsuario } from '../interfaces/patrullajeUsuario';
import BarraNavInferior from '../components/barraNavInferior';
import PatrullajeCard from '../components/PatrullajeCard';

const esPatrullajeVisible = (patrullaje: PatrullajeUsuario, ahoraMs: number): boolean => {
  const estado = (patrullaje.estado || '').trim().toLowerCase();
  if (estado === 'finalizado') return false;
  if (estado === 'en curso') return true;

  const terminoMs = patrullaje.hora_termino
    ? new Date(patrullaje.hora_termino).getTime()
    : Number.NaN;

  return Number.isNaN(terminoMs) || ahoraMs <= terminoMs;
};

const PatrullajeInicio: React.FC = () => {
  const { usuario } = useUsuario();
  const nombreUsuario = usuario?.nombre;
  const [mandarAlerta] = useIonAlert();

  const [listaPatrullajes, setListaPatrullajes] = useState<PatrullajeUsuario[]>([]);
  const [chequeoTick, setChequeoTick] = useState<number>(0);

  // Cargar los patrullajes vigentes (planificados no vencidos o en curso) del usuario autenticado
  useIonViewWillEnter(() => {
    const cargarPatrullajesDelUsuario = async () => {
      try {
        const patrullajes = await usuarioService.obtenerPatrullajesUsuario();
        const ahoraMs = Date.now();
        const patrullajesVigentes = (patrullajes || []).filter((patrullaje) =>
          esPatrullajeVisible(patrullaje, ahoraMs)
        );
        setListaPatrullajes(patrullajesVigentes);
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

  // Oculta automáticamente un patrullaje planificado si supera su hora de término con la pantalla abierta
  useEffect(() => {
    const proximoVencimiento = listaPatrullajes
      .filter((p) => (p.estado || '').trim().toLowerCase() === 'planificado')
      .map((p) => (p.hora_termino ? new Date(p.hora_termino).getTime() : Number.NaN))
      .filter((ms) => !Number.isNaN(ms))
      .sort((a, b) => a - b)[0];

    if (proximoVencimiento === undefined) return;

    const msHastaVencer = proximoVencimiento - Date.now();
    const espera = msHastaVencer <= 0 ? 50 : Math.min(msHastaVencer + 50, 30000);

    const timer = setTimeout(() => {
      const ahoraMs = Date.now();
      setListaPatrullajes((prev) => {
        const vigentes = prev.filter((patrullaje) =>
          esPatrullajeVisible(patrullaje, ahoraMs)
        );
        return vigentes.length === prev.length ? prev : vigentes;
      });
      setChequeoTick((t) => t + 1);
    }, espera);

    return () => clearTimeout(timer);
  }, [listaPatrullajes, chequeoTick]);

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
                <PatrullajeCard
                  key={patrullaje.id_patrullaje}
                  patrullaje={patrullaje}
                />
              ))
            ) : (
              <div className="sin-patrullajes">
                <p>No tienes patrullajes pendientes o en curso actualmente.</p>
              </div>
            )}
          </div>

        </div>
      </IonContent>

      {/* Barra de navegación inferior */}
      <BarraNavInferior />
    </IonPage>
  );
};

export default PatrullajeInicio;
