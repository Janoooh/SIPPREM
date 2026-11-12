import axios from "axios";
import { Preferences } from "@capacitor/preferences";

export const apiClient = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    headers: {"Content-Type":"application/json",},
    timeout: 10000 //10 seg
});

apiClient.interceptors.request.use(
    async (config) => {
        const {value: token} = await Preferences.get({key: "token"});
        if (token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const codigo = error.response?.status;
        const rutaActual = window.location.pathname;
        if (codigo === 401 && rutaActual !== "/login"){
            await Preferences.remove({key: "token"});
            await Preferences.remove({key: "usuario"});
            window.location.href = "/login";
        };

        if(codigo === 403 && rutaActual !== "/login"){
            window.history.back();
        };
        return Promise.reject(error);
    }
);
