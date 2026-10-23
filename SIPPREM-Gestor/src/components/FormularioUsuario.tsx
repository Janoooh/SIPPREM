import React, { useState, useEffect, useRef } from 'react';
import {
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonAvatar,
  IonImg,
  useIonAlert,
} from '@ionic/react';
import { cloudUploadOutline } from 'ionicons/icons';
import './FormularioUsuario.css';
import type { dataUsuario } from '../interfaces/dataUsuario';


export interface FormularioUsuarioProps {
  usuarioInicial?: dataUsuario; //Info de un usuario, si es para modificar
  modo?: 'agregar' | 'modificar'; //Objetivo con que se usara el componente
  onSubmit: (datos: dataUsuario) => void | Promise<void>; //Funcion callback para ejercer la logica al mandar el form
  cargando?: boolean; //Estado para evitar multiples peticiones al presionar boton del form
}


const FormularioUsuario: React.FC<FormularioUsuarioProps> = ({
  usuarioInicial,
  modo = 'agregar',
  onSubmit,
  cargando = false
}) => {

  const [mandarAlerta] = useIonAlert();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para cada uno de los campos del formulario
  const [nombre, setNombre] = useState<string>('');
  const [rut, setRut] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [idRol, setIdRol] = useState<number | null>(null);
  const [foto, setFoto] = useState<string | null>(null);

  /* Se utiliza el hook useEffect para actualizar los datos de los campos cuando se
  quiere utilizar este componente para modificar.*/
  useEffect(() => {
    if (usuarioInicial) {
      if (usuarioInicial.nombre) setNombre(usuarioInicial.nombre);
      if (usuarioInicial.rut) setRut(usuarioInicial.rut);
      if (usuarioInicial.correo) setCorreo(usuarioInicial.correo);
      if (usuarioInicial.telefono) setTelefono(usuarioInicial.telefono);
      if (usuarioInicial.foto) setFoto(usuarioInicial.foto);
      if (usuarioInicial.id_rol) setIdRol(Number(usuarioInicial.id_rol));
    };
  }, [usuarioInicial]); /*Se ejecuta la funcion al detectar cambio en usuario inicial. */

  /*Funcion handleSeleccionarFotoClick: Encargada de abrir el selector de archivos cuando
  hacemos click en el icono de foto.*/
  const handleSeleccionarFotoClick = () => {
    fileInputRef.current?.click();
  };

  /*Funcion handleArchivoFotoSeleccionada: Encargada de procesar la imagen que se subio
  por medio del selector de archivos.*/
  const handleArchivoFotoSeleccionada = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0];
    if (archivo) {
      // Limitamos la foto a un tamanio de 3 mb para no saturar con fotos grandes.
      if (archivo.size > 3 * 1024 * 1024) {
        mandarAlerta({
          header: 'Imagen muy pesada',
          message: 'Por favor seleccione una imagen de menos de 3 MB.',
          buttons: ['Aceptar']
        });
        return;
      }

      const lector = new FileReader();
      lector.onloadend = () => {
        setFoto(lector.result as string);
      };
      lector.readAsDataURL(archivo);
    }
  };


  /*Funcion handleSubmit: Encargada de validar los datos ingresados, y enviarlos a la funcion
  handle que llega por callback.*/
  const handleSubmit = () => {
    
    const regexRut = /^[0-9]{7,8}-[0-9kK]{1}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validar el rut para ver si tiene el guion, y esta solo compuesto por numeros y/o la letra k.
    if (!regexRut.test(rut.trim())){
      mandarAlerta({
        header: 'Formato inválido',
        subHeader: 'Rut incorrecto',
        message: 'El rut solo puede contener numeros, guion y letra K (Ejemplo: 12345678-k).',
        buttons: ['Aceptar']
      });
      return;
    };

    // Validar formato del correo ingresado, viendo si tiene el @ y el dominio.
    if (!regexCorreo.test(correo.trim())){
      mandarAlerta({
        header: 'Formato inválido',
        subHeader: 'Correo incorrecto',
        message: 'El correo debe tener un @ y terminar con un dominio (Ejemplo: prueba@dominio.cl).',
        buttons: ['Aceptar']
      });
      return;
    };

    // Validar formato de telefono si fue ingresado (debe tener 9 digitos exactos).
    if (telefono.trim() && telefono.trim().length !== 9) {
      mandarAlerta({
        header: 'Formato inválido',
        subHeader: 'Teléfono incorrecto',
        message: 'El teléfono debe contener exactamente 9 números (Ejemplo: 912345678).',
        buttons: ['Aceptar']
      });
      return;
    }

    // Si todas las validaciones son exitosas, se mandan los datos a la funcion de callback
    onSubmit({
      rut: rut.trim(),
      nombre: nombre.trim(),
      correo: correo.trim().toLowerCase(),
      telefono: telefono.trim() ? `+56${telefono.trim()}` : '',
      id_rol: idRol as number,
      foto: foto,
      tipo_rol: idRol === 1 ? "admin" : idRol === 2 ? "supervisor" : "patrullero"
    });
  };

  const esModificar = modo === 'modificar';

  return (
    <IonGrid className="formulario-usuario-container">
      
      {/*Input oculto para cargar archivos de imagen*/}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleArchivoFotoSeleccionada}
        accept="image/jpeg"
        style={{ display: 'none' }}
      />

      <IonRow>
        
        {/*Campos de texto del formulario.*/}
        <IonCol size="12" sizeMd="7" className="form-campos-col">
          
          {/*Titulo del formulario. */}
          <IonText className="form-titulo">
            {esModificar ? 'Modificar usuario' : 'Registrar usuario nuevo'}
          </IonText>

          {/*Campo del nombre. */}
          <IonLabel className="form-label">
            Nombre completo
            <IonText className="asterisco-obligatorio"> (*)</IonText>
          </IonLabel>
          <IonInput
            className="form-input"
            value={nombre}
            placeholder="Ej. Juan Pérez Soto"
            onIonInput={(e: any) => setNombre(e.detail.value!)}
            clearInput={true}
          />

          {/*Campo del rut. */}
          <IonLabel className="form-label">
            RUT
            <IonText className="asterisco-obligatorio"> (*)</IonText>
          </IonLabel>
          <IonInput
            className={`form-input ${esModificar ? 'form-input-disabled' : ''}`}
            value={rut}
            placeholder="12345678-9"
            disabled={esModificar}
            onIonInput={(e: any) => setRut(e.detail.value!)}
            clearInput={!esModificar}
          />

          {/*Campo del correo. */}
          <IonLabel className="form-label">
            Correo
            <IonText className="asterisco-obligatorio"> (*)</IonText>
          </IonLabel>
          <IonInput
            type="email"
            className="form-input"
            value={correo}
            placeholder="ejemplo@sipprem.cl"
            onIonInput={(e: any) => setCorreo(e.detail.value!)}
            clearInput={true}
          />

          {/*Campo del telefono. */}
          <IonLabel className="form-label">
            Teléfono
          </IonLabel>
          <IonInput
            type="tel"
            className="form-input"
            value={telefono}
            placeholder="912345678"
            maxlength={9}
            onKeyDown={(e) => {
              /*Esta funcion permite que solo se ingresen numeros, y se puedan usar teclas para manejo en el campo. */
              if (['Backspace','Delete','ArrowLeft','ArrowRight','Tab','0','1','2','3','4','5','6','7','8','9'].includes(e.key)) return;
              e.preventDefault();
            }}
            onIonInput={(e: any) => {
              /*Esta funcion hace si se copia una cadena, solo queden los numeros. */
              const soloNumeros = (e.detail.value || "").replace(/\D/g, '').slice(0, 9);
              setTelefono(soloNumeros);
              if (e.target){
                e.target.value = soloNumeros;
              }
            }}
            clearInput={true}
          />

          {/*Lista desplegable del rol. */}
          <IonRow className="ion-align-items-center rol-row">
            <IonCol size="12" sizeSm="3" className="rol-label-col">
              <IonLabel className="form-label ion-no-margin">
                ROL
                <IonText className="asterisco-obligatorio"> (*)</IonText>
              </IonLabel>
            </IonCol>
            <IonCol size="12" sizeSm="9" className="form-select-col">
              <IonSelect
                className="form-select"
                value={idRol}
                placeholder="Seleccione un rol..."
                interface="popover"
                onIonChange={(e: any) => setIdRol(e.detail.value)}
              >
                <IonSelectOption value={1}>Administrador</IonSelectOption>
                <IonSelectOption value={2}>Supervisor</IonSelectOption>
                <IonSelectOption value={3}>Patrullero</IonSelectOption>
              </IonSelect>
            </IonCol>
          </IonRow>

          {/*Informacion sobre campos obligatorios. */}
          <IonText className="form-nota-obligatorios">
            Los (*) son campos obligatorios
          </IonText>

        </IonCol>

        {/*Seccion para subir foto de perfil, y mandar el formulario. */}
        <IonCol size="12" sizeMd="5" className="form-foto-col">
          
          {/*Foto de perfil presionable para subir foto. */}
          <IonAvatar 
            className="foto-picker-wrapper" 
            onClick={handleSeleccionarFotoClick}
            title="Presione para cargar o cambiar la foto de perfil"
          >
            {/*Cargamos la foto del usuario, o la sinFoto */}
            <IonImg
              src={foto || '/assets/fotoPerfil.png'}
              alt="Foto de perfil"
              className="foto-picker-img"
            />
            {/*Icono de subir foto. */}
            <IonRow className="foto-overlay">
              <IonIcon icon={cloudUploadOutline} className="foto-overlay-icon" />
              <IonText className="foto-overlay-texto">Subir foto</IonText>
            </IonRow>
          </IonAvatar>

          {/*Boton para enviar el formulario. */}
          <IonButton
            className="btn-submit-usuario"
            shape="round"
            onClick={handleSubmit}
            disabled={!nombre.trim() || !rut.trim() || !correo.trim() || !idRol || cargando}
          >
            {cargando ? 'Guardando...' : esModificar ? 'Guardar cambios' : 'Crear usuario'}
          </IonButton>

        </IonCol>

      </IonRow>
    </IonGrid>
  );
};

export default FormularioUsuario;
