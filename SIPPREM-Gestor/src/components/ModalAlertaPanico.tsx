import React from 'react';
import {
  IonModal,
  IonButton,
  IonIcon
} from '@ionic/react';
import {
  warningOutline,
  locateOutline,
  timeOutline,
  personOutline,
  folderOutline,
  mapOutline
} from 'ionicons/icons';
import type { AlertaPanicoRecibida } from '../interfaces/ubicacionPatrullero';
import './ModalAlertaPanico.css';

interface ModalAlertaPanicoProps {
  alerta: AlertaPanicoRecibida | null;
  cantidadPendientes: number;
  onVerEnMapa: (alerta: AlertaPanicoRecibida) => void;
  onDescartar: (idAlerta: string) => void;
}

const formatearHoraAlerta = (fechaIso: string | null | undefined): string => {
  if (!fechaIso) return '--:--:--';
  const fecha = new Date(fechaIso);
  return !Number.isNaN(fecha.getTime())
    ? fecha.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    : '--:--:--';
};

const ModalAlertaPanico: React.FC<ModalAlertaPanicoProps> = ({
  alerta,
  cantidadPendientes,
  onVerEnMapa,
  onDescartar
}) => {
  return (
    <IonModal
      isOpen={Boolean(alerta)}
      backdropDismiss={false}
      onDidDismiss={() => {
        if (alerta) {
          onDescartar(alerta.idAlerta);
        }
      }}
      className="modal-alerta-panico"
    >
      {alerta && (
        <div className="modal-panico-contenedor">
          <div className="modal-panico-cabecera">
            <div className="modal-panico-titulo-fila">
              <span className="modal-panico-pulso" />
              <IonIcon icon={warningOutline} className="modal-panico-icono-alerta" />
              <span className="modal-panico-titulo">ALERTA DE PÁNICO</span>
            </div>

            {cantidadPendientes > 1 && (
              <span className="modal-panico-cola-badge">
                +{cantidadPendientes - 1} en espera
              </span>
            )}
          </div>

          <p className="modal-panico-subtitulo">
            Un patrullero solicitó apoyo de emergencia inmediato.
          </p>

          <div className="modal-panico-detalles">
            <div className="modal-panico-item">
              <IonIcon icon={personOutline} className="modal-panico-item-icono" />
              <div>
                <span className="modal-panico-etiqueta">Patrullero</span>
                <p className="modal-panico-valor">
                  {alerta.nombre || 'No informado'} ({alerta.rut})
                </p>
              </div>
            </div>

            <div className="modal-panico-item">
              <IonIcon icon={folderOutline} className="modal-panico-item-icono" />
              <div>
                <span className="modal-panico-etiqueta">Proyecto</span>
                <p className="modal-panico-valor">{alerta.nombreProyecto}</p>
              </div>
            </div>

            <div className="modal-panico-item">
              <IonIcon icon={timeOutline} className="modal-panico-item-icono" />
              <div>
                <span className="modal-panico-etiqueta">Hora de emisión</span>
                <p className="modal-panico-valor">
                  {formatearHoraAlerta(alerta.fecha_hora)}
                </p>
              </div>
            </div>

            <div className="modal-panico-item">
              <IonIcon icon={locateOutline} className="modal-panico-item-icono" />
              <div>
                <span className="modal-panico-etiqueta">Coordenadas</span>
                <p className="modal-panico-valor">
                  {alerta.latitud.toFixed(5)}, {alerta.longitud.toFixed(5)}
                </p>
              </div>
            </div>
          </div>

          <div className="modal-panico-acciones">
            <IonButton
              expand="block"
              className="btn-panico-ver-mapa"
              onClick={() => onVerEnMapa(alerta)}
            >
              <IonIcon icon={mapOutline} slot="start" />
              Ver en Mapa GPS
            </IonButton>

            <IonButton
              expand="block"
              fill="outline"
              className="btn-panico-entendido"
              onClick={() => onDescartar(alerta.idAlerta)}
            >
              Entendido
            </IonButton>
          </div>
        </div>
      )}
    </IonModal>
  );
};

export default ModalAlertaPanico;
