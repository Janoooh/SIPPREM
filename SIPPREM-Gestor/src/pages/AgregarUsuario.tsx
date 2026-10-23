import { IonPage,
        IonHeader,
        IonContent,
        useIonAlert,
        useIonRouter
} from "@ionic/react";

import HeaderSistema from "../components/HeaderSistema";
import FormularioUsuario from "../components/FormularioUsuario";
import { useUsuario } from "../hooks/obtenerUsuario";
import { dataUsuario } from "../interfaces/dataUsuario";
import { useState } from "react";
import { usuariosService } from "../services/usuariosService";

const AgregarUsuario: React.FC = () => {
    
    const {usuario} =  useUsuario();
    const [mandarAlerta] = useIonAlert();
    const router = useIonRouter();

    const [cargando,setCargando] = useState<boolean>(false);
    
    const handleCrearUsuario = async (datos: dataUsuario) => {
        try{
            setCargando(true);

            const resBackend = await usuariosService.crearUsuario(datos);

            mandarAlerta({
                header: 'Usuario creado.',
                message: 'El usuario se creo correctamente.',
                buttons: [{text: 'Aceptar', 
                        handler: () => {
                            router.push("/admin/usuarios","back");
                        }}]
            });

        }catch(error: any){
            mandarAlerta({
                header: 'Error al crear',
                message: error.response?.data?.message || 'No fue posible crear el usuario.',
                buttons: ['Aceptar']
            });
        }finally{
            setCargando(false);
        }
    };

    return(
        <IonPage>
            <IonHeader className="ion-no-border">
                <HeaderSistema rol={usuario.tipo_rol}/>
            </IonHeader>

            <IonContent fullscreen style={{ '--background': '#3b5066' } as React.CSSProperties}>
                <FormularioUsuario 
                    modo="agregar" 
                    onSubmit={handleCrearUsuario} 
                    cargando={cargando}
                />
            </IonContent>
        </IonPage>
    );
};

export default AgregarUsuario;