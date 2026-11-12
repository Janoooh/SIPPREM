import { IonPage,
        IonHeader,
        IonContent,
        useIonAlert,
        useIonRouter
} from "@ionic/react";

import { useParams } from "react-router";
import HeaderSistema from "../components/HeaderSistema";
import FormularioUsuario from "../components/FormularioUsuario";
import { useUsuario } from "../hooks/obtenerUsuario";
import { dataUsuario } from "../interfaces/dataUsuario";
import { useEffect, useState } from "react";
import { usuariosService } from "../services/usuariosService";


const ModificarUsuario : React.FC = () => {

    const {id_user} = useParams<{id_user: string}>();
    
    const {usuario} = useUsuario();
    const [mandarAlerta] = useIonAlert();
    const router = useIonRouter();
    
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<dataUsuario | undefined>(undefined);
    const [cargando, setCargando] = useState<boolean>(false);

    useEffect(()=>{
        const conseguirUsuario = async(rut: string) => {
            try{
                const resObtenerUsuario = await usuariosService.obtenerUsuario(rut as string);
                setUsuarioSeleccionado(resObtenerUsuario.data.data);
            }catch(error: any){
                mandarAlerta({
                header: 'Error al cargar usuario a modificar',
                message: error.response?.data?.message || 'No fue posible cargar el usuario seleccionado.',
                buttons: [{text: 'Aceptar',
                        handler: ()=>{
                            router.push("/admin/usuarios","back");
                }}]
            });
            };
        };
        if (id_user){
            conseguirUsuario(id_user);
        }
    },[id_user]);

    const handleModificarUsuario = async (data: dataUsuario) => {
        try{
            setCargando(true);

            const resBackend = await usuariosService.modificarUsuario(data);

            mandarAlerta({
                header: 'Usuario modificado.',
                message: 'El usuario se modifico correctamente.',
                buttons: [{text: 'Aceptar', 
                        handler: () => {
                            router.push("/admin/usuarios","back");
                        }}]
            });

        }catch(error: any){
            mandarAlerta({
                header: 'Error al modificar',
                message: error.response?.data?.message || 'No fue posible modificar el usuario.',
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
                    usuarioInicial={usuarioSeleccionado}
                    modo="modificar" 
                    onSubmit={handleModificarUsuario} 
                    cargando={cargando}
                />
            </IonContent>
        </IonPage>
    );
};

export default ModificarUsuario;