import React, { useState, useEffect } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonContent, 
  IonGrid, 
  IonRow, 
  IonCol, 
  IonText, 
  IonLabel, 
  IonButton, 
  IonItem, 
  IonInput, 
  IonIcon,
  IonSpinner,
  IonToggle,
  useIonViewWillEnter,
  useIonRouter,
  useIonAlert
} from '@ionic/react';
import { searchOutline } from 'ionicons/icons';
import HeaderSistema from '../components/HeaderSistema';
import UsuarioCard from '../components/UsuarioCard';
import { useUsuario } from '../hooks/obtenerUsuario';
import type { dataUsuario } from '../interfaces/dataUsuario';
import { usuariosService } from '../services/usuariosService';
import './Usuarios.css';


interface dataUsuarioConEliminar extends dataUsuario{
  eliminado: boolean
};

const Usuarios: React.FC = () => {

  // Hook para obtener la informacion de la sesion actual (usuario en sesion y su rol)
  const { usuario: usuarioSesion } = useUsuario();
  const nombreUsuario = usuarioSesion.nombre;
  const rol = usuarioSesion.tipo_rol;

  const router = useIonRouter();
  const [mandarAlerta] = useIonAlert();

  // Estado para cargar lista de usuarios.
  const [usuarios, setUsuarios] = useState<dataUsuarioConEliminar[]>([]);

  // Estado para controlar la carga de datos cuando se tenga llamada asincrona.
  const [cargando, setCargando] = useState<boolean>(false);

  // Estado para mostrar o no los usuarios eliminados.
  const [mostrarEliminados, setMostrarEliminados] = useState<boolean>(false);

  // Funcion cargarUsuario: Encargada de usar usuariosService para traer del backend los
  // usuarios registrados en el sistema. Usa mostrarEliminados para ver si obtiene los eliminados,
  // o los activos.
  const cargarUsuarios = async (verEliminados: boolean = mostrarEliminados) => {
    try {

      setCargando(true);
      
      const estadoParam = verEliminados ? "eliminados" : "";
      const respuesta = await usuariosService.obtenerUsuarios(estadoParam);

      setUsuarios(respuesta); // Guardamos los usuarios que se obtuvieron con el hook de useState.

    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      mandarAlerta({
        header: "Error",
        message: "No fue posible cargar la lista de usuarios.",
        buttons: ["Aceptar"]
      });
    } finally {
      setCargando(false); // Al llegar aqui ya se cargaron los usuarios del backend.
    }
  };

  // Uso de hook useEffect para cargar la lista de usuario al inicio, y cuando se cambie el switch de mostrar eliminados.
  useEffect(() => {
    cargarUsuarios(mostrarEliminados);
  }, [mostrarEliminados]);

  // Uso de hook useIonViewWillEnter para cargar la lista de usuarios siempre que se entra a la ventana, teniendo
  // la version mas actualizada, y no la guardada en memoria con datos anteriores.
  useIonViewWillEnter(() => {
    cargarUsuarios(mostrarEliminados);
  });

  // Estado para gestionar la barra de busqueda.
  const [textoBusqueda, setTextoBusqueda] = useState<string>('');

  // Funcion para filtrar la lista de usuarios visibles segun lo que tengamos escrito en la barra
  // de busqueda. La barra de busqueda se basa en los nombres de los usuarios.
  const usuariosFiltrados = usuarios.filter((itemUsuario) => {
    // Si la barra esta vacia retornamos todos los usuarios (todos cumplen, por eso true).
    if (!textoBusqueda.trim()) return true;

    // Si lo que esta escrito en la barra de busqueda esta contenido en el nombre de algun usuario
    // entonces se deja en la lista, sino se quita.
    const nombreCoincide = itemUsuario.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
    return nombreCoincide;
  });

  // Funcion handleAgregarUsuario: Representa la logica a ejecutar cuando el usuario
  // presione el boton de agregar usuario.
  const handleAgregarUsuario = () => {
    
    // AQUI A FUTURO TENGO QUE PONERLE LO DE REEDIRIGIR AL FORM PARA CREAR USUARIO.
    mandarAlerta({
      header: 'Agregar usuario',
      message: 'TENGO QUE CAMBIAR ESTO POR EL FORMULARIO',
      buttons: ['Entendido']
    });
  };

  // Funcion handleEditarUsuario: Representa la logica a ejecutar cuando el usuario
  // presione el boton de modificar usuario, que esta en la usuarioCard.
  const handleEditarUsuario = (usuarioSeleccionado: dataUsuarioConEliminar) => {
    // AQUI A FUTURO TENGO QUE PONERLE LO DE REEDIRIGIR AL FORM PARA MODIFICAR USUARIO.
    mandarAlerta({
      header: 'Editar usuario',
      message: `CAMBIAR ESTO POR UNA REEDIRECCION AL FORM DE MODIFICAR.`,
      buttons: ['Aceptar']
    });
  };

  // Funcion handleEliminarUsuario: Representa la logica a ejecutar cuando el usuario
  // presione el boton de borrar usuario, que esta en la usuarioCard.
  const handleEliminarUsuario = (usuarioSeleccionado: dataUsuarioConEliminar) => {

    // Si el usuario que tratamos de eliminar somos nosotros lo impedimos.
    if (usuarioSeleccionado.rut.toLowerCase() === usuarioSesion.rut.toLowerCase()) {
      mandarAlerta({
        header: 'Acción no permitida',
        message: 'No puedes eliminar tu propia cuenta de administrador.',
        buttons: ['Entendido']
      });
      return;
    }

    // Se prohibe eliminar el usuario admin root.
    if (usuarioSeleccionado.rut.toLowerCase() === "00000000-0") {
      mandarAlerta({
        header: 'Acción no permitida',
        message: 'No puedes eliminar el administrador root.',
        buttons: ['Entendido']
      });
      return;
    }

    mandarAlerta({
      header: 'Confirmar eliminación',
      subHeader: usuarioSeleccionado.nombre,
      message: '¿Está seguro de que desea eliminar a este usuario del sistema?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            // Usamos eliminarUsuario de usuariosServices para quitar al user del backend, y 
            // actualizamos la lista de usuarios quitandolo.
            usuariosService.eliminarUsuario(usuarioSeleccionado.rut);
            setUsuarios((prev) => prev.filter((u) => u.rut !== usuarioSeleccionado.rut));
          }
        }
      ]
    });
  };

  // Funcion handleRestaurarUsuario: Representa la logica a ejecutar cuando el usuario
  // presione el boton de restaurar usuario, que esta en la usuarioCard.
  const handleRestaurarUsuario = (usuarioSeleccionado: dataUsuarioConEliminar) => {
    mandarAlerta({
      header: 'Confirmar restauracion',
      subHeader: usuarioSeleccionado.nombre,
      message: '¿Está seguro de que desea restaurar a este usuario del sistema?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Restaurar',
          handler: () => {
            // Usamos restaurarUsuario de usuariosServices para restaurar al user del backend, y 
            // actualizamos la lista de usuarios quitando al restaurado.
            usuariosService.restaurarUsuario(usuarioSeleccionado.rut);
            setUsuarios((prev) => prev.filter((u) => u.rut !== usuarioSeleccionado.rut));
          }
        }
      ]
    });
  };

  return (
    <IonPage>
      
      <IonHeader className="ion-no-border">
        <HeaderSistema nombreUsuario={nombreUsuario} rol={rol} />
      </IonHeader>


      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <IonGrid className="usuarios-grid ion-padding">
          
          {/*Titulo de seccion, boton agregar usuario, barra de busqueda y switch para mostrar eliminados.*/}
          <IonRow className="ion-align-items-center ion-justify-content-between usuarios-top-row">
            
            {/*Titulo de seccion.*/}
            <IonCol size="12" sizeMd="6" className="usuarios-left-header">
              <IonText className="usuarios-titulo">
                Lista de usuarios
              </IonText>
              
              {/*Boton para agregar usuario.*/}
              <IonButton 
                className="btn-agregar-usuario" 
                shape="round" 
                onClick={handleAgregarUsuario}
              >
                Agregar usuario
              </IonButton>
            </IonCol>

            {/*Barra de busqueda.*/}
            <IonCol size="12" sizeMd="6" className="usuarios-search-col">
              <IonRow className="ion-align-items-center ion-justify-content-end busqueda-wrapper">
                
                <IonCol size="12" sizeSm="auto" className="ion-text-sm-right">
                  <IonLabel className="buscar-usuario-label">
                    Buscar por nombre:
                  </IonLabel>
                </IonCol>


                <IonCol size="12" sizeSm="auto">
                  <IonItem lines="none" className="busqueda-item">
                    <IonIcon slot="start" icon={searchOutline} className="busqueda-icono" />
                    <IonInput
                      value={textoBusqueda}
                      placeholder="Escriba un nombre..."
                      aria-label="Buscar usuario por nombre"
                      onIonInput={(e: any) => setTextoBusqueda(e.detail.value!)}
                      className="busqueda-input"
                      clearInput={true}
                    />
                  </IonItem>
                </IonCol>

              </IonRow>

              {/*Switch para mostrar los usuarios activos, o los eliminados.*/}
              <IonRow className="ion-align-items-center ion-justify-content-end switch-wrapper">
                <IonCol size="auto" className="switch-col">
                  <IonLabel className="switch-label">
                    Mostrar eliminados
                  </IonLabel>
                  <IonToggle
                    checked={mostrarEliminados}
                    onIonChange={(e) => setMostrarEliminados(e.detail.checked)}
                    className="custom-toggle"
                    aria-label="Mostrar usuarios eliminados"
                  />
                </IonCol>
              </IonRow>
            </IonCol>

          </IonRow>

          {/*Spinner para mostrar cuando se esta cargando los datos del backend.*/}
          {cargando && (
            <IonRow className="ion-justify-content-center ion-margin-top">
              <IonSpinner name="crescent" color="light" />
            </IonRow>
          )}

          {/*Lista de usuarios obtenidos del backend, y mostrados con el componente usuarioCard.*/}
          {!cargando && (
            <IonRow className="usuarios-lista-row">
              <IonCol size="12">
                {usuariosFiltrados.length > 0 ? (
                  usuariosFiltrados.map((usuarioItem) => (
                    <UsuarioCard
                      key={usuarioItem.rut}
                      nombre={usuarioItem.nombre}
                      rol={usuarioItem.tipo_rol}
                      correo={usuarioItem.correo}
                      foto={usuarioItem.foto}
                      eliminado={usuarioItem.eliminado}
                      onEditar={() => handleEditarUsuario(usuarioItem)}
                      onEliminar={() => handleEliminarUsuario(usuarioItem)}
                      onRestaurar={() => handleRestaurarUsuario(usuarioItem)}
                    />
                  ))
                ) : (
                  /*Mensaje para indicar por que no hay usuarios en la lista.*/
                  <IonGrid className="sin-usuarios-box">
                    <IonRow className="ion-justify-content-center">
                      <IonCol size="12">
                        <IonText className="sin-usuarios-texto">
                          {textoBusqueda.trim()
                            ? `No se encontraron usuarios que coincidan con "${textoBusqueda}".`
                            : mostrarEliminados
                            ? "No hay usuarios eliminados en el sistema."
                            : "No hay usuarios activos registrados en el sistema."}
                        </IonText>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                )}
              </IonCol>
            </IonRow>
          )}

        </IonGrid>
      </IonContent>

    </IonPage>
  );
};

export default Usuarios;
