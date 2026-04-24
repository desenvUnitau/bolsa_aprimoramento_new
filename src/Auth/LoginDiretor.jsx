import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { api, setAuthToken } from '../config/api';
import { TOKEN_KEYS } from '../config/auth';
import FormLogin from './Form/FormLogin';
import './Login.css';

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join('')
    );

    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function LoginDiretor() {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginSubmit = async (formData) => {
    setErrorMessage('');

    try {
      const response = await api.post('/api/auth/login', formData);
      const token = response.data?.token ?? response.data?.accessToken;

      if (!token) {
        toast.error('Token de autenticação não recebido. Verifique as credenciais e tente novamente.');
        return;
      }

      const payload = parseJwtPayload(token);
      const perfil = payload?.perfil?.toString() ?? response.data?.perfil?.toString();

      if (perfil !== '2') {
        toast.error('Acesso negado. Apenas diretor pode acessar aqui.');
        setErrorMessage('Apenas diretor pode fazer login aqui.');
        return;
      }

      localStorage.setItem(TOKEN_KEYS.diretor, token);
      setAuthToken(token);
      navigate('/diretor', { replace: true });
    } catch (err) {
      console.error('Erro ao realizar login do diretor', err);
      setErrorMessage('Não foi possível realizar o login do diretor. Verifique suas credenciais.');
      toast.error('Não foi possível realizar o login do diretor. Verifique suas credenciais.');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div>
          {errorMessage ? <p className="text-danger mb-3">{errorMessage}</p> : null}
          <FormLogin
            labelTop="Login Diretor"
            idPlaceHtml1="Matrícula"
            id="matricula"
            idPlaceHtml2="Senha"
            typeInput="password"
            onSubmit={handleLoginSubmit}
            idSenha="senha"
          />
        </div>
      </div>
    </div>
  );
}
