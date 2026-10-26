import { Navigate, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { RutaProtegida } from './routes/rutaProtegida';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import AgregarProyecto from './pages/AgregarProyecto';
import ModificarProyecto from './pages/ModificarProyecto';
import InicioProyecto from './pages/InicioProyecto';
import CambiarClaveInicial from './pages/CambiarClaveInicial';
import Usuarios from './pages/Usuarios';
import AgregarUsuario from './pages/AgregarUsuario';
import ModificarUsuario from './pages/ModificarUsuario';
import Inventario from './pages/Inventario';
import AgregarVehiculo from './pages/AgregarVehiculo';
import AgregarArticulo from './pages/AgregarArticulo';

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

          <Route path="/admin/proyecto/editar/:id_proyecto" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <ModificarProyecto />
            </RutaProtegida>
          } />

          {/* Se unifica el parametro :id_proyecto para que coincida con las subrutas e InicioProyecto */}
          <Route path="/admin/proyecto/:id_proyecto" element={
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

          <Route path="/admin/proyecto/:id_proyecto/inventario" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
                <Inventario />
            </RutaProtegida>
          } />

          <Route path="/admin/proyecto/:id_proyecto/inventario/vehiculos/agregar" element={
           <RutaProtegida rolesPermitidos={["admin"]}>
                <AgregarVehiculo />
          </RutaProtegida>
          } />

          <Route path="/admin/proyecto/:id_proyecto/inventario/articulos/registrar" element={
            <RutaProtegida rolesPermitidos={["admin"]}>
              <AgregarArticulo />
            </RutaProtegida>
          } />


          {/*Rutas de supervisor*/}

          <Route path="/supervisor/inicio" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
                <Inicio />
            </RutaProtegida>
          } />

          <Route path="/supervisor/proyecto/:id_proyecto" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
                <InicioProyecto />
            </RutaProtegida>
          } />

          <Route path="/supervisor/proyecto/:id_proyecto/inventario" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
                <Inventario />
            </RutaProtegida>
          } />

          <Route path="/supervisor/proyecto/:id_proyecto/inventario/vehiculos/agregar" element={
           <RutaProtegida rolesPermitidos={["supervisor"]}>
                <AgregarVehiculo />
          </RutaProtegida>
          } />

          <Route path="/supervisor/proyecto/:id_proyecto/inventario/articulos/registrar" element={
            <RutaProtegida rolesPermitidos={["supervisor"]}>
              <AgregarArticulo />
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
