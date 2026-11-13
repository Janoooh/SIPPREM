import React from 'react';
import {
  IonLabel,
  IonButton,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { dataVehiculo } from '../services/vehiculoService';
import { dataEqPersonal } from '../services/EquipamientoPersonalService';
import './FormularioIniciarPatrullaje.css';

export interface FormularioIniciarPatrullajeProps {
  listaVehiculos: dataVehiculo[];
  patenteSeleccionada: string;
  setPatenteSeleccionada: (patente: string) => void;
  cargandoVehiculos: boolean;
  listaArticulos: dataEqPersonal[];
  articulosSeleccionados: string[];
  setArticulosSeleccionados: (articulos: string[]) => void;
  cargandoArticulos: boolean;
  onIniciarPatrullaje: () => void;
}

const FormularioIniciarPatrullaje: React.FC<FormularioIniciarPatrullajeProps> = ({
  listaVehiculos,
  patenteSeleccionada,
  setPatenteSeleccionada,
  cargandoVehiculos,
  listaArticulos,
  articulosSeleccionados,
  setArticulosSeleccionados,
  cargandoArticulos,
  onIniciarPatrullaje
}) => {
  return (
    <div className="formulario-iniciar-patrullaje">
      {/* Selección de vehículo */}
      <div className="form-group">
        <IonLabel className="label-form">Patente del vehículo a utilizar:</IonLabel>
        <div className="input-box-patente">
          <IonSelect
            value={patenteSeleccionada}
            placeholder={cargandoVehiculos ? "Cargando vehículos..." : "Seleccione un vehículo"}
            onIonChange={e => setPatenteSeleccionada(e.detail.value ?? '')}
            className="select-patente"
          >
            {listaVehiculos.map((vehiculo) => (
              <IonSelectOption key={vehiculo.id_item} value={vehiculo.id_item}>
                {vehiculo.id_item} - {vehiculo.nombre_vehiculo}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>

      {/* Título Artículos a utilizar */}
      <div className="seccion-articulos-header">
        <IonLabel className="label-form">Articulos a utilizar (Equipamiento)</IonLabel>
      </div>

      {/* Selección múltiple de equipamiento personal obtenido de la BD */}
      <div className="form-group">
        <div className="input-box-patente">
          <IonSelect
            multiple={true}
            value={articulosSeleccionados}
            placeholder={cargandoArticulos ? "Cargando equipamiento..." : "Seleccione equipamiento personal"}
            onIonChange={e => setArticulosSeleccionados(e.detail.value ?? [])}
            className="select-patente"
          >
            {listaArticulos.map((art) => (
              <IonSelectOption key={art.id_item} value={art.id_item}>
                {art.tipo_eq_personal} (Talla: {art.talla}) - [{art.id_item}]
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>

      {/* Lista visual de los artículos seleccionados */}
      <div className="lista-articulos-container">
        {articulosSeleccionados.length > 0 ? (
          articulosSeleccionados.map((idItem) => {
            const itemEncontrado = listaArticulos.find(a => a.id_item === idItem);
            return itemEncontrado ? (
              <div className="fila-articulo-prep" key={idItem}>
                <span className="articulo-nombre">{itemEncontrado.tipo_eq_personal}</span>
                <span className="articulo-cantidad">Talla: {itemEncontrado.talla}</span>
              </div>
            ) : null;
          })
        ) : (
          <p className="sin-equipamiento-texto">No hay equipamiento seleccionado</p>
        )}
      </div>

      <div className="boton-iniciar-container">
        <IonButton expand="block" className="btn-iniciar-patrullaje" onClick={onIniciarPatrullaje}>
          Iniciar patrullaje
        </IonButton>
      </div>
    </div>
  );
};

export default FormularioIniciarPatrullaje;
