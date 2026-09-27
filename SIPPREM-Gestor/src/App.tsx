import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useState } from 'react';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import AgregarProyecto from './pages/AgregarProyecto';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import { navigate } from 'ionicons/icons';

interface datosUsuario{
  nombre: string,
  rol: string
};

setupIonicReact();

const App: React.FC = () => {

  const [usuario, setUsuario] = useState<datosUsuario>({'nombre':'NotData', 'rol':'NotData'});

  return (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        
        {/*Ruta publica del login.*/}
        <Route path="/login" element={<Login setUsuario={setUsuario} />} />

        {/*Rutas protegidas.*/}

        <Route path="/admin/inicio" element={usuario.nombre !== "NotData" 
              ? <Inicio nombreUsuario={usuario.nombre} rol={usuario.rol}/>
              : <Navigate to="/login" replace />
              } />
        <Route path="/admin/agregar-proyecto" element={usuario.nombre !== "NotData" 
              ? <AgregarProyecto nombreUsuario={usuario.nombre} rol={usuario.rol}/>
              : <Navigate to="/login" replace />
              } />
        <Route path="/supervisor/inicio" element={usuario.nombre !== "NotData"
              ? <Inicio nombreUsuario={usuario.nombre} rol={usuario.rol}/>
              : <Navigate to="/login" replace />
              } />

        {/*Ruta de seguridad, reedirige al login cuando tratan de acceder a la raiz.*/}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/*Ruta de seguridad, reedirige al login cuando ingresan una ruta inexistente.*/}
        <Route path='*' element={<Navigate to="/login" replace />}></Route>
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
)};

export default App;
