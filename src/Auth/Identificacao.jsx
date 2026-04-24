import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, setAuthToken } from '../config/api';
import { TOKEN_KEYS, setStoredAlunoData } from '../config/auth';
import FormLogin from './Form/FormLogin';
import './Login.css';

export default function Identificacao(){
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleIdentificationSubmit = async (formData) => {
        const ra = formData?.ra?.trim();
        const cpf = formData?.cpf?.replace(/\D/g, '');

        setIsSubmitting(true);

        try {
            const response = await api.post(
                '/alunos/importarMentor',
                null,
                {
                    params: {
                        cpf,
                        ra
                    }
                }
            );

            const { token, status, dadosAluno } = response.data ?? {};

            if (status === 'ENCONTRADO_NO_MENTOR') {
                if (!token) {
                    toast.error('Token de autenticação não recebido.');
                    return;
                }

                localStorage.setItem(TOKEN_KEYS.aluno, token);
                setStoredAlunoData(dadosAluno);
                setAuthToken(token);
                toast.success('Aluno identificado com sucesso.');
                navigate('/', { replace: true });
                return;
            }

            if (status === 'EXISTE_NO_SISTEMA') {
                toast.warn('Que o cadastro dele já foi enviado, aguarde o setor entrar em contato');
                return;
            }

            if (status === 'NAO_ENCONTRADO') {
                toast.error('Por favor, verifique a sua matricula no sistema acadêmico (MENTOR)');
                return;
            }

            toast.error(response.data?.message ?? 'Não foi possível localizar o aluno.');
        } catch (error) {
            console.error('Erro ao identificar aluno', error);
            toast.error('Não foi possível validar seus dados agora. Tente novamente em instantes.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div>
            <div className="d-flex justify-content-center align-items-center mt-5">
                <div>
                <FormLogin mask={'000.000.000-00'} labelTop='Identificação' 
                    idPlaceHtml1={'RA'} id={'ra'} idPlaceHtml2={'CPF'} idSenha={'cpf'} onSubmit={handleIdentificationSubmit}/>
                </div>
            </div>
        </div>
    )
}