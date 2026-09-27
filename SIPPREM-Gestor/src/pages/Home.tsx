import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';

interface homeProps{
    nombreUsuario: string,
    rol: string
};

const Home: React.FC<homeProps> = ({nombreUsuario, rol}) => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>SIPPRAM</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        {rol === 'ADMIN' && (
          <h2>Bienvenido, {nombreUsuario}</h2>
        )}
        {rol === 'SUPERVISOR' && (
          <h2>Bienvenido, {nombreUsuario}!!!</h2>
        )}
        <ExploreContainer />
      </IonContent>
    </IonPage>
  );
};

export default Home;
