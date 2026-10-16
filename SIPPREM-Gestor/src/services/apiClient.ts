import axios from "axios";

export const apiClient = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    headers: {"Content-Type":"application/json",},
    timeout: 10000 //10 seg
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token && config.headers){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (res) => res,
    (error) => {
        if (error.response?.status === 401){
            const rutaActual = window.location.pathname;
            if (rutaActual !== "/login"){
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);