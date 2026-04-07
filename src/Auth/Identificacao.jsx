import FormLogin from './Form/FormLogin';
import './Login.css';

export default function Identificacao(){
    return(
        <div>
            <div className="d-flex justify-content-center align-items-center mt-5">
                <FormLogin mask={'000.000.000-00'} labelTop='Identificação' 
                    idPlaceHtml1={'RA'}  idPlaceHtml2={'CPF'}/>
            </div>
        </div>
    )
}