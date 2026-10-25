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

export const esPoligonoValido = (zona: string): boolean => {

    if (typeof zona !== "string") return false;

    // Se verifica que el texto venga con formato de poligono, valido para postgis.
    const match = zona.trim().match(/^POLYGON\s*\(\((.+)\)\)$/i);
    if (!match || !match[1]) return false;

    const puntos = match[1].split(",").map(p => p.trim());

    if (puntos.length < 4) return false;

    // Se valida si cada coordenada es valida
    const coordenadasValidas = puntos.every(punto => {
        const coords = punto.split(/\s+/);
        return coords.length === 2 && !isNaN(Number(coords[0])) && !isNaN(Number(coords[1]));
    });

    if (!coordenadasValidas) return false;

    // Se valida si el primer punto es igual al ultimo.
    return puntos[0] === puntos[puntos.length - 1];
};