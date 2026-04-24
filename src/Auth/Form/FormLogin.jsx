import { useState } from "react";
import { IMaskInput } from "react-imask";

export default function FormLogin({labelTop, idPlaceHtml1, id, idSenha, mask, typeInput = "text", idPlaceHtml2, onSubmit}){

    const [formData, setFormData] = useState({
        field1: "",
        field2: ""
    });

    const handleChange = (fieldName) => (eventOrValue) => {
        const value = typeof eventOrValue === "string"
            ? eventOrValue
            : eventOrValue?.target?.value ?? "";

        setFormData((currentData) => ({
            ...currentData,
            [fieldName]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!onSubmit) {
            return;
        }

        await onSubmit({
            [id]: formData.field1,
            [idSenha]: formData.field2
        });
    };

     const renderInput = () => {
        if (mask) {
        return (
            <IMaskInput
            mask={mask}
            className="form-control"
            id={idPlaceHtml2}
            placeholder={idPlaceHtml2}
            value={formData.field2}
            onAccept={handleChange("field2")}
            required
            />
        );
        }

        return (
        <input
            type={typeInput}
            className="form-control"
            id={idPlaceHtml2}
            placeholder={idPlaceHtml2}
            value={formData.field2}
            onChange={handleChange("field2")}
            required
        />
        );
    };




    return(
        <form className="login-form" onSubmit={handleSubmit}>
            <h2 className="mb-4 text-center">{labelTop}</h2>
            <div className="form-floating mb-3">
                <input type="text"
                    className="form-control"
                    id={id}
                    placeholder={idPlaceHtml1}
                    value={formData.field1}
                    onChange={handleChange("field1")}
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