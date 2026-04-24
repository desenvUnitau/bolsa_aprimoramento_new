import axios from "axios";
import { ACCESS_TYPES, LOGIN_ROUTES, clearAccessSession, getAccessTypeByPath, getStoredToken } from "./auth";

export const API_BASE_URL = "http://localhost:8082";

export const api = axios.create({
    baseURL: API_BASE_URL
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
            const accessType = getAccessTypeByPath(window.location.pathname);
            
            clearAccessSession(accessType);
            setAuthToken(null);
            window.location.href = LOGIN_ROUTES[accessType];

        }
        return Promise.reject(err);
    }
);

export const initAuth = () => {
    const preferredAccessType = getAccessTypeByPath(window.location.pathname);
    const token = getStoredToken(preferredAccessType);

    if (token) {
        setAuthToken(token);
    }
};