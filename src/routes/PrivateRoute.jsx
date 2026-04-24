import { Navigate, useLocation } from "react-router-dom";
import { LOGIN_ROUTES, getAccessTypeByPath, getStoredToken } from "../config/auth";

export default function PrivateRoute({ children, access }) {
    const location = useLocation();
    const accessType = access ?? getAccessTypeByPath(location.pathname);
    const token = getStoredToken(accessType);

    if (!token) {
        const redirectPath = LOGIN_ROUTES[accessType] ?? LOGIN_ROUTES.aluno;
        return <Navigate to={redirectPath} replace state={{ from: location }} />;
    }

    return children;
}