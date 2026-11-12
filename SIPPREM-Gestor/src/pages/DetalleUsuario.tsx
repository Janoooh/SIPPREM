import React from 'react';
import { IonPage, IonHeader, IonContent, useIonRouter } from '@ionic/react';
import { useParams } from 'react-router-dom';
import HeaderSistema from '../components/HeaderSistema';
import PerfilUsuario from '../components/PerfilUsuario';
import { useUsuario } from '../hooks/obtenerUsuario';

const DetalleUsuario: React.FC = () => {
  const { id_user } = useParams<{ id_user: string }>();
  const { usuario } = useUsuario();
  const router = useIonRouter();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <HeaderSistema rol={usuario.tipo_rol} />
      </IonHeader>

      <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
        <PerfilUsuario
          idUsuario={id_user}
          onErrorVolver={() => router.push('/admin/usuarios', 'back')}
        />
      </IonContent>
    </IonPage>
  );
};

export default DetalleUsuario;
