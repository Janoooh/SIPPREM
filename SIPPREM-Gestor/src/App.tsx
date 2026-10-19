import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import type { dataUsuario } from './interfaces/dataUsuario';
import { RutaProtegida } from './routes/rutaProtegida';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import AgregarProyecto from './pages/AgregarProyecto';
import InicioProyecto from './pages/InicioProyecto';
import CambiarClaveInicial from './pages/CambiarClaveInicial';

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

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          {/*Ruta publica del login.*/}
          <Route path="/login" element={<Login />} />

          {/*Ruta publica para cambio de clave inicial.*/}

          {/*Rutas protegidas.*/}

          <Route path="/cambiar-clave-inicial" element={
            <RutaProtegida rolesPermitidos={["admin","supervisor"]}>
              <CambiarClaveInicial />
            </RutaProtegida>
          } />

          <Route path="/admin/inicio" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <Inicio />
            </RutaProtegida>
          } />

          <Route path="/admin/agregar-proyecto" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <AgregarProyecto />
            </RutaProtegida>
          } />

          <Route path="/admin/proyecto/:id" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <InicioProyecto />
            </RutaProtegida>
          } />


          <Route path="/supervisor/inicio" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
                <Inicio />
            </RutaProtegida>
          } />

          <Route path="/supervisor/proyecto/:id" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
                <InicioProyecto />
            </RutaProtegida>
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
