import { apiClient } from './apiClient';
import { Preferences } from '@capacitor/preferences';
import type { dataUsuario } from '../interfaces/dataUsuario';

export interface CredencialesLogin {
  identificador: string;
  clave: string;
}

export interface RespuestaLogin {
  token: string;
  datosUsuario: dataUsuario;
}

export const authService = {

  /*Funcion iniciarSesion: Encargada de iniciar y guardar la sesion en el navegador por medio de
  Preferences. Para el inicio de sesion en el backend utiliza apiClient, entregando a la API
  el identificador y la clave del usuario que desea logear. */
  iniciarSesion: async ({ identificador, clave }: CredencialesLogin): Promise<RespuestaLogin> => {

    const datosPeticion = {
      idIngresado: identificador.trim(),
      claveIngresada: clave.trim()
    };

    const resLogin = await apiClient.post("/auth", datosPeticion);

    const { token, datosUsuario } = resLogin.data.data;

    const datosUsuarioLower: dataUsuario = {
      rut: datosUsuario.rut.toLowerCase(),
      nombre: datosUsuario.nombre.toLowerCase(),
      correo: datosUsuario.correo.toLowerCase(),
      foto: datosUsuario.foto,
      nuevo_user: datosUsuario.nuevo_user,
      id_rol: datosUsuario.id_rol,
      tipo_rol: datosUsuario.tipo_rol.toLowerCase()
    };

    await Preferences.set({ key: "token", value: token });
    await Preferences.set({ key: "usuario", value: JSON.stringify(datosUsuarioLower) });
    window.dispatchEvent(new Event("sipprem-sesion-actualizada"));

    return {
      token,
      datosUsuario: datosUsuarioLower
    };
  },

  /*Funcion cambiarClave: Encargada de modificar la clave de un usuario que tiene una
  clave aleatoria asignada. El backend identifica al usuario mediante el token JWT.*/
  cambiarClave: async (claveNueva: string): Promise<void> => {

    const datosPeticion = {
      claveNuevaIng: claveNueva.trim()
    };

    await apiClient.patch("/auth", datosPeticion);

    return;
  }
};
