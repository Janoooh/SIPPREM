import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { RutaProtegida } from './routes/rutaProtegida'; 
import Login from './pages/Login';                       
import CambiarClaveInicial from './pages/CambiarClaveInicial'; 
import PatrullajeInicio from './pages/PatrullajeInicio'; 
import PreparacionPatrullaje from './pages/PreparacionPatrullaje';  

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact({mode :'md'});

const App: React.FC = () => {

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          {/* Ruta pública del login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas para Patrulleros */}

          {/* Ruta de cambio de clave inicial (si el patrullero es nuevo) */}
          <Route path="/cambiar-clave-inicial" element={
            <RutaProtegida rolesPermitidos={["patrullero"]}>
              <CambiarClaveInicial />
            </RutaProtegida>
          } />

          {/* Panel principal del patrullero en la app móvil */}
          <Route path="/patrullero/inicio" element={
            <RutaProtegida rolesPermitidos={["patrullero"]}>
              <PatrullajeInicio />
            </RutaProtegida>
          } />


          {/* Panel principal del patrullero en la app móvil */}
          <Route path="/patrullero/proyecto/:id_proyecto/preparacion" element={
            <RutaProtegida rolesPermitidos={["patrullero"]}>
              <PreparacionPatrullaje />
            </RutaProtegida>
          } />


          {/* Rutas de seguridad */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path='*' element={<Navigate to="/login" replace />} />

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;