import { BoxArrowRight } from 'react-bootstrap-icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { setAuthToken } from '../../config/api';
import { ACCESS_TYPES, LOGIN_ROUTES, clearAccessSession, getAccessTypeByPath, getStoredToken } from '../../config/auth';
import './Cabecalho.css';
import logo from '../../assets/imagens/unitau_branco.png';

export default function Cabecalho(){
    const location = useLocation();
    const navigate = useNavigate();
    const accessType = getAccessTypeByPath(location.pathname);
    const isAdminRoute = accessType === ACCESS_TYPES.admin || accessType === ACCESS_TYPES.secretaria || accessType === ACCESS_TYPES.diretor;
    const currentToken = getStoredToken(accessType);

    const handleLogout = () => {
        clearAccessSession(accessType);
        setAuthToken(null);
        navigate(LOGIN_ROUTES[accessType], { replace: true });
    };

    return(
         <nav className="navbar navbar-expand-lg cabecalho-custom">
            <div className="container cabecalho-content">
                <Link className="navbar-brand d-flex align-items-center" to={isAdminRoute ? '/admin' : '/'}>
                    <img 
                        src={logo} 
                        alt="Logo" 
                    />
                    <span className="d-none d-md-inline">Bolsa Aprimoramento</span>
                </Link>

                {currentToken ? (
                    <button type="button" className="cabecalho-logout" onClick={handleLogout}>
                        <BoxArrowRight size={18} />
                    </button>
                ) : null}
            </div>
        </nav>
    )
}