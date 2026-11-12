import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol,
  IonLabel,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonRadio,
  IonRadioGroup,
  useIonRouter,
  useIonAlert,
  useIonToast
} from '@ionic/react';
import HeaderSistema from '../components/HeaderSistema';
import MenuLateralProyecto from '../components/MenuLateralProyecto';
import './Inventario.css';
import './AgregarArticulo.css';
import { useUsuario } from '../hooks/obtenerUsuario';
import { useParams } from 'react-router-dom';
import { vehiculosService } from '../services/vehiculoService';
import { eqVehicularService} from '../services/EquipamientoVehicularService';
import { eqPersonalService} from '../services/EquipamientoPersonalService';

const RegistrarArticulo: React.FC = () => {
  const { usuario } = useUsuario();
  const rol = usuario.tipo_rol;
  const rolRuta = (rol || 'supervisor').toLowerCase();
  const { id_proyecto } = useParams<{ id_proyecto: string }>();
  const router = useIonRouter();

  const [mandarAlerta] = useIonAlert();
  const [mandarToast] = useIonToast();

  // Estado para alternar categoría: 'personal' o 'vehicular'
  const [categoria, setCategoria] = useState<'personal' | 'vehicular'>('personal');

  // Listas desplegables
  const [tiposArticulo, setTiposArticulo] = useState<any[]>([]);
  const [listaVehiculos, setListaVehiculos] = useState<any[]>([]);
  const [cargandoTipos, setCargandoTipos] = useState<boolean>(false);

  // Campos del formulario
  const [idTipoSeleccionado, setIdTipoSeleccionado] = useState<number | undefined>(undefined);
  const [identificador, setIdentificador] = useState<string>('');
  const [talla, setTalla] = useState<string>('');
  const [vehiculoRelacionado, setVehiculoRelacionado] = useState<string | null>(null);

  // Cargar tipos según la categoría seleccionada y la lista de vehículos del proyecto
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargandoTipos(true);
        setIdTipoSeleccionado(undefined);

        if (categoria === 'personal') {
          const tiposP = await eqPersonalService.obtenerTiposArticulosPersonales(String(id_proyecto));
          setTiposArticulo(tiposP || []);
        } else {
          const tiposV = await eqVehicularService.obtenerTiposArticulosVehiculares(String(id_proyecto));
          setTiposArticulo(tiposV || []);

          // Cargar vehículos para el selector de relación
          const vehs = await vehiculosService.obtenerVehiculos(String(id_proyecto));
          setListaVehiculos(vehs || []);
        }
      } catch (error) {
        console.error("Error al cargar opciones:", error);
        setTiposArticulo([]);
      } finally {
        setCargandoTipos(false);
      }
    };

    if (id_proyecto) {
      cargarDatos();
    }
  }, [categoria, id_proyecto]);

  // Manejador para registrar el artículo
  const handleRegistrar = async () => {
    if (!idTipoSeleccionado || !identificador.trim()) {
      mandarAlerta({
        header: "Campos incompletos",
        message: "Por favor, seleccione el tipo e ingrese un identificador válido.",
        buttons: ["Aceptar"]
      });
      return;
    }

    try {
      if (categoria === 'personal') {
        await eqPersonalService.agregarArticuloPersonal(String(id_proyecto), {
          id_item: identificador.trim(),
          id_tipo: Number(idTipoSeleccionado),
          talla: talla
        });
      } else {
        await eqVehicularService.agregarArticuloVehicular(String(id_proyecto), {
          id_item: identificador.trim(),
          id_tipo: Number(idTipoSeleccionado),
          id_vehiculo: vehiculoRelacionado === "ninguno" ? null : vehiculoRelacionado
        });
      }

      mandarToast({
        message: "¡Artículo registrado correctamente!",
        duration: 3000,
        position: "bottom",
        color: "success"
      });

      router.push(`/${rolRuta}/proyecto/${id_proyecto}/inventario`, 'back');

    } catch (error: any) {
      mandarAlerta({
        header: "Error al registrar",
        message: error.response?.data?.message || "No fue posible registrar el artículo.",
        buttons: ["Aceptar"]
      });
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={rol} />
      </IonHeader>

      <IonContent fullscreen className="registrar-articulo-content">
        <IonGrid className="inicio-proyecto-grid ion-padding">
          <IonRow>
            
            {/* Componente reutilizable del Menú Lateral Izquierdo */}
            <IonCol size="12" sizeMd="3" className="menu-lateral-col">
              <MenuLateralProyecto
                idProyecto={id_proyecto}
                rol={rol}
                opcionActiva="inventario"
              />
            </IonCol>

            {/* Columna Central: Formulario dinámico */}
            <IonCol size="12" sizeMd="7" className="ion-padding-start">
              <IonLabel className="titulo-seccion">Registrar Artículo</IonLabel>

              <div className="form-registrar-container">
                
                {/* Categoría de Artículo (Radio Group) */}
                <div className="grupo-categoria">
                  <IonLabel className="label-form-art">Categoría de Artículo</IonLabel>
                  <IonRadioGroup 
                    value={categoria} 
                    onIonChange={e => setCategoria(e.detail.value)}
                    className="radio-group-art"
                  >
                    <div className="radio-option">
                      <IonRadio value="personal" />
                      <IonLabel>Equipamiento Personal</IonLabel>
                    </div>
                    <div className="radio-option">
                      <IonRadio value="vehicular" />
                      <IonLabel>Equipamiento Vehicular</IonLabel>
                    </div>
                  </IonRadioGroup>
                </div>

                {/* Tipo de Artículo (Desplegable dinámico) */}
                <div className="grupo-input-art">
                  <IonLabel className="label-form-art">Tipo de Artículo</IonLabel>
                  <div className="input-box-art">
                    <IonSelect 
                      value={idTipoSeleccionado}
                      placeholder={cargandoTipos ? "Cargando..." : "Seleccione un tipo"}
                      onIonChange={e => setIdTipoSeleccionado(e.detail.value)}
                      className="select-art"
                    >
                      {tiposArticulo.map((tipo) => (
                        <IonSelectOption 
                          key={tipo.id_tipo_eq_personal || tipo.id_tipo_eq_vehicular} 
                          value={tipo.id_tipo_eq_personal || tipo.id_tipo_eq_vehicular}
                        >
                          {tipo.tipo_eq_personal || tipo.tipo_eq_vehicular}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </div>
                </div>

                {/* Identificador */}
                <div className="grupo-input-art">
                  <IonLabel className="label-form-art">Identificador</IonLabel>
                  <div className="input-box-art">
                    <IonInput 
                      value={identificador}
                      onIonInput={e => setIdentificador(e.detail.value!)}
                      placeholder="Ej. ID-9923"
                      className="input-field-art"
                    />
                  </div>
                </div>

                {/* Campo condicional: Talla (Solo para Equipamiento Personal) */}
                {categoria === 'personal' && (
                  <div className="grupo-input-art">
                    <IonLabel className="label-form-art">Talla (Opcional)</IonLabel>
                    <div className="input-box-art">
                      <IonInput 
                        value={talla}
                        onIonInput={e => setTalla(e.detail.value!)}
                        placeholder="Ej. L, M, XL"
                        className="input-field-art"
                      />
                    </div>
                  </div>
                )}

                {/* Campo condicional: Vehículo Relacionado (Solo para Equipamiento Vehicular) */}
                {categoria === 'vehicular' && (
                  <div className="grupo-input-art">
                    <IonLabel className="label-form-art">Vehículo al que está relacionado</IonLabel>
                    <div className="input-box-art">
                      <IonSelect 
                        value={vehiculoRelacionado}
                        placeholder="Seleccione un vehículo"
                        onIonChange={e => setVehiculoRelacionado(e.detail.value)}
                        className="select-art"
                      >
                        <IonSelectOption value="ninguno">Ninguno</IonSelectOption>
                        {listaVehiculos.map((v) => (
                          <IonSelectOption key={v.id_item} value={v.id_item}>
                            {v.nombre_vehiculo} ({v.id_item})
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </div>
                  </div>
                )}

                {/* Botón Registrar */}
                <div className="btn-registrar-art-wrapper">
                  <IonButton 
                    expand="block" 
                    onClick={handleRegistrar}
                    className="btn-registrar-art-final"
                  >
                    Registrar artículo
                  </IonButton>
                </div>

              </div>
            </IonCol>

          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RegistrarArticulo;
