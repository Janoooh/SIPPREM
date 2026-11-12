import React from 'react';
import {
  IonRow,
  IonCol,
  IonLabel,
  IonButton,
  useIonRouter
} from '@ionic/react';
import { useLocation, useParams } from 'react-router-dom';
import { useUsuario } from '../hooks/obtenerUsuario';
import './MenuLateralProyecto.css';

// Opciones posibles dentro del menú lateral de un proyecto
export type OpcionMenuProyecto =
  | 'inicio'
  | 'cronograma'
  | 'inventario'
  | 'mapa'
  | 'historial'
  | 'personal';

interface MenuLateralProyectoProps {
  idProyecto?: string;
  rol?: string;
  opcionActiva?: OpcionMenuProyecto;
}

const MenuLateralProyecto: React.FC<MenuLateralProyectoProps> = ({
  idProyecto,
  rol,
  opcionActiva
}) => {
  const router = useIonRouter();
  const location = useLocation();
  const params = useParams<{ id_proyecto?: string; id?: string }>();
  const { usuario } = useUsuario();

  const idProyectoActual = idProyecto || params.id_proyecto || params.id || '';
  const rolActual = (rol || usuario.tipo_rol || 'supervisor').toLowerCase();

  // Base de la URL para las rutas del proyecto según el rol del usuario
  const baseRutaProyecto = `/${rolActual}/proyecto/${idProyectoActual}`;

  // Determinamos qué opción está activa (por prop explícita o inspeccionando el pathname)
  const seccionActiva: OpcionMenuProyecto = React.useMemo(() => {
    if (opcionActiva) return opcionActiva;
    const path = location.pathname.toLowerCase();
    if (path.includes('/inventario')) return 'inventario';
    if (path.includes('/cronograma')) return 'cronograma';
    if (path.includes('/mapa')) return 'mapa';
    if (path.includes('/historial')) return 'historial';
    if (path.includes('/personal')) return 'personal';
    return 'inicio';
  }, [opcionActiva, location.pathname]);

  // Navega hacia una subruta del proyecto
  const irARuta = (subRuta: string = '') => {
    if (!idProyectoActual) return;
    const destino = `${baseRutaProyecto}${subRuta}`;
    if (location.pathname !== destino) {
      router.push(destino, 'forward');
    }
  };

  return (
    <IonRow className="menu-container">
      <IonCol size="12" className="ion-no-padding">
        <IonLabel className="menu-titulo">Menú de Opciones</IonLabel>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Inicio del proyecto */}
        <IonButton
          className={`menu-btn ${seccionActiva === 'inicio' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'inicio' ? 'solid' : 'clear'}
          onClick={() => irARuta('')}
        >
          Inicio
        </IonButton>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Cronograma del proyecto */}
        <IonButton
          className={`menu-btn ${seccionActiva === 'cronograma' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'cronograma' ? 'solid' : 'clear'}
          onClick={() => irARuta('/cronograma')}
        >
          Cronograma
        </IonButton>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Inventario del proyecto */}
        <IonButton
          className={`menu-btn ${seccionActiva === 'inventario' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'inventario' ? 'solid' : 'clear'}
          onClick={() => irARuta('/inventario')}
        >
          Inventario
        </IonButton>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Mapa GPS*/}
        <IonButton
          className={`menu-btn ${seccionActiva === 'mapa' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'mapa' ? 'solid' : 'clear'}
        >
          Mapa GPS
        </IonButton>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Historial de Patrullajes*/}
        <IonButton
          className={`menu-btn ${seccionActiva === 'historial' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'historial' ? 'solid' : 'clear'}
        >
          Historial de Patrullajes
        </IonButton>
        <IonRow className="menu-divider"></IonRow>

        {/* Botón Personal*/}
        <IonButton
          className={`menu-btn ${seccionActiva === 'personal' ? 'menu-btn-activo' : ''}`}
          expand="block"
          fill={seccionActiva === 'personal' ? 'solid' : 'clear'}
          onClick={() => irARuta('/personal')}
        >
          Personal
        </IonButton>
      </IonCol>
    </IonRow>
  );
};

export default MenuLateralProyecto;
