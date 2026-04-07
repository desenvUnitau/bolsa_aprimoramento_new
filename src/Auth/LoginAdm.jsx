import FormLogin from './Form/FormLogin';
import './Login.css';

export default function LoginAdm(){
    return(
        <div>
            <div className="d-flex justify-content-center align-items-center mt-5">
                <FormLogin labelTop='Login Administrador' idPlaceHtml1={'Matrícula'} 
                    idPlaceHtml2={'Senha'} typeInput="password" />
            </div>
        </div>
    )
}