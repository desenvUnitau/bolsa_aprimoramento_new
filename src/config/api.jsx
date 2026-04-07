import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8082"
});

export const setAuthToken = (token) =>{
    if(token){
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }else {
        delete api.defaults.headers.common["Authorization"];
    }
};

api.interceptors.response.use(
    res => res,
    async err =>{
        if(err.response?.status === 401){
            console.warn('401 Unauthorized - token inválido ou expirado');
            localStorage.removeItem("bolsaAprimora");
            setAuthToken(null);
            window.location.href = "/login";
            

        }
        return Promise.reject(err);
    }
);

export const initAuth = () => {
    const token = localStorage.getItem("bolsaAprimora");
    if (token) {
        setAuthToken(token);
    }
};