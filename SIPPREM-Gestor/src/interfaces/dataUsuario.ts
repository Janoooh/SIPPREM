export interface dataUsuario{
    rut: string,
    nombre: string,
    correo: string,
    telefono?: string,
    foto: string | null,
    nuevo_user?: boolean,
    id_rol: number,
    tipo_rol: string
};