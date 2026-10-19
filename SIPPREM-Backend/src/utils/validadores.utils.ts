export const esRutValido = (rut: string): boolean => {
    const regexRut = /^[0-9]{7,8}-[0-9kK]{1}$/;
    return regexRut.test(rut);
};

export const esCorreoValido = (correo: string): boolean => {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return  regexCorreo.test(correo);
};

export const esRolValido = (rol: number): boolean => {
    return [1,2,3].includes(rol);
};

export const esClaveValida = (clave : string): boolean => {
    return clave.length >= 8;
};