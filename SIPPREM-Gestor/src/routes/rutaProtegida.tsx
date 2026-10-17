import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Preferences } from '@capacitor/preferences';
import type { dataUsuario } from '../interfaces/dataUsuario';
import { obtenerUsuarioActual } from '../services/obtenerUsuario';
import { IonSpinner } from '@ionic/react';

interface PropsRutaProtegida {
  // children es una función que recibe el usuario leído de Preferences
  children: React.ReactNode; 
  rolesPermitidos: string[];
}

export const RutaProtegida: React.FC<PropsRutaProtegida> = ({ children, rolesPermitidos}) => {

  const [usuario, setUsuario] = useState<dataUsuario | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(()=> {
    const verificarSesion = async () => {
        const user = await obtenerUsuarioActual();

        setUsuario(user);
        setCargando(false);
    };
    verificarSesion();
  },[]);

  /*useEffect(() => {
    const verificar = async () => {
      
      const { value } = await Preferences.get({ key: "usuario" });

      if (!value) {
        setAutorizado(false);
        return;
      }

      const datosUser: dataUsuario = JSON.parse(value);

      if (rolesPermitidos.includes(datosUser.tipo_rol)) {
        setUsuario(datosUser);
        setAutorizado(true);
      }else{
        setAutorizado(false);
      }
    };

    verificar();
  }, [location.key, rolesPermitidos.join(",")]);*/

  if (cargando) return <IonSpinner/>; // Espera a que termine de leer Preferences

  if (!usuario){
    return <Navigate to="/login" replace />
  };

  if(!rolesPermitidos.includes(usuario.tipo_rol)){
    return <Navigate to="/login" replace />
  };

  return <>{children}</>;
  //return autorizado && usuario ? <>{children(usuario)}</> : <Navigate to="/login" replace />;
};