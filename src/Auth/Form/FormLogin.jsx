import { IMaskInput } from "react-imask";

export default function FormLogin({labelTop, idPlaceHtml1, mask, typeInput, idPlaceHtml2}){
     const renderInput = () => {
        if (mask) {
        return (
            <IMaskInput
            mask={mask}
            className="form-control"
            id={idPlaceHtml2}
            placeholder={idPlaceHtml2}
            />
        );
        }

        return (
        <input
            type={typeInput}
            className="form-control"
            id={idPlaceHtml2}
            placeholder={idPlaceHtml2}
        />
        );
    };
    return(
        <form className="login-form">
            <h2 className="mb-4 text-center">{labelTop}</h2>
            <div className="form-floating mb-3">
                <input type="text"
                    className="form-control"
                    id={idPlaceHtml1}
                    placeholder={idPlaceHtml1}
                    required
                />
                <label htmlFor={idPlaceHtml1}>{idPlaceHtml1}</label>
            </div>
            <div className="form-floating mb-3">
                {renderInput()}
                <label htmlFor={idPlaceHtml2}>{idPlaceHtml2}</label>
            </div>

            <div className="mb-3 d-flex">
                <button type="submit" className="btn btn-custom w-100">Entrar</button>
            </div>
        </form>
    )
}