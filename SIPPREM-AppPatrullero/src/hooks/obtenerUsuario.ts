import { useState, useEffect } from "react";
import { Preferences } from "@capacitor/preferences";
import type { dataUsuario } from "../interfaces/dataUsuario";
import { useIonViewWillEnter } from "@ionic/react";

const sinUser: dataUsuario = {
  rut: "NotData",
  nombre: "NotData",
  correo: "NotData",
  foto: null,
  nuevo_user: false,
  id_rol: -1,
  tipo_rol: "NotData"
};

export const obtenerUsuarioActual = async () => {
  const { value } = await Preferences.get({ key: "usuario" });
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};


// Hook para obtener el usuario en cualquier Pagina
export const useUsuario = () => {
  const [usuario, setUsuario] = useState<dataUsuario>(sinUser);
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  const cargar = () => {
    obtenerUsuarioActual().then((datos) => {
      setUsuario(datos);
      setCargandoUsuario(false);
    });
  };

  useEffect(() => {cargar()} ,[]);

  useIonViewWillEnter(() => {cargar()});

  return { usuario, cargandoUsuario };
};