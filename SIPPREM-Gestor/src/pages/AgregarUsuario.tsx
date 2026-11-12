import { IonPage,
        IonHeader,
        IonContent,
        useIonAlert,
        useIonRouter,
        useIonToast
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
    const [mandarToast] = useIonToast();
    const router = useIonRouter();

    const [cargando,setCargando] = useState<boolean>(false);
    
    const handleCrearUsuario = async (datos: dataUsuario) => {
        try{
            setCargando(true);

            const resBackend = await usuariosService.crearUsuario(datos);

            mandarAlerta({
                header: 'Usuario creado.',
                subHeader: `LA CLAVE ALEATORIA ES: ${resBackend.data?.data}`,
                message: 'El usuario se creo correctamente.',
                buttons: [{text: 'Copiar clave y aceptar', 
                        handler: () => {
                            navigator.clipboard.writeText(resBackend.data?.data);
                            mandarToast({
                                message: '¡Clave copiada al portapapeles!',
                                duration: 3000, // 3 segundos de duracion
                                position: 'bottom',
                                color: 'success'
                            });
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
                    modo="modificar" 
                    onSubmit={handleCrearUsuario} 
                    cargando={cargando}
                />
            </IonContent>
        </IonPage>
    );
};

export default AgregarUsuario;