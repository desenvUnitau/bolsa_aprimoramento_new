import { Navigate, useLocation } from "react-router-dom";
import { HOME_ROUTES, getAccessTypeByPath, getStoredToken } from "../config/auth";

export default function GuestRoute({ children }) {
    const location = useLocation();
    const accessType = getAccessTypeByPath(location.pathname);
    const token = getStoredToken(accessType);

    if (token) {
        const homePath = HOME_ROUTES[accessType] ?? HOME_ROUTES.aluno;
        return <Navigate to={homePath} replace />;
    }

    return children;
}
