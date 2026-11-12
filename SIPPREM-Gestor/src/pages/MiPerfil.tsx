import React from 'react';
import { IonPage, IonHeader, IonContent } from '@ionic/react';
import HeaderSistema from '../components/HeaderSistema';
import PerfilUsuario from '../components/PerfilUsuario';
import { useUsuario } from '../hooks/obtenerUsuario';

const MiPerfil: React.FC = () => {
  const { usuario } = useUsuario();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={usuario.tipo_rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <PerfilUsuario />
      </IonContent>
    </IonPage>
  );
};

export default MiPerfil;
