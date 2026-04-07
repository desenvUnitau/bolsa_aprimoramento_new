import './Cabecalho.css';
import logo from '../../assets/imagens/unitau_branco.png';

export default function Cabecalho(){
    return(
         <nav className="navbar navbar-expand-lg cabecalho-custom">
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <img 
                        src={logo} 
                        alt="Logo" 
                    />
                    <span className="d-none d-md-inline">Bolsa Aprimoramento</span>
                </a>
            </div>
        </nav>
    )
}