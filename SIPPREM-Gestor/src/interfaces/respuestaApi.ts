export interface respuestaApi<T>{
    ok: boolean,
    message: string,
    data: T
};