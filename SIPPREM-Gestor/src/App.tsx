import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { RutaProtegida } from './routes/rutaProtegida';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import AgregarProyecto from './pages/AgregarProyecto';
import InicioProyecto from './pages/InicioProyecto';
import CambiarClaveInicial from './pages/CambiarClaveInicial';
import Usuarios from './pages/Usuarios';
import AgregarUsuario from './pages/AgregarUsuario';
import ModificarUsuario from './pages/ModificarUsuario';

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

          {/*Rutas protegidas.*/}

          {/*Ruta de cambio de clave*/}
          <Route path="/cambiar-clave-inicial" element={
            <RutaProtegida rolesPermitidos={["admin","supervisor"]}>
              <CambiarClaveInicial />
            </RutaProtegida>
          } />

          {/*Rutas de administrador*/}

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

          <Route path="/admin/usuarios" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <Usuarios />
            </RutaProtegida>
          } />

          <Route path="/admin/usuarios/agregar" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <AgregarUsuario />
            </RutaProtegida>
          } />

          <Route path="/admin/usuarios/editar/:id_user" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <ModificarUsuario />
            </RutaProtegida>
          } />


          {/*Rutas de supervisor*/}

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
