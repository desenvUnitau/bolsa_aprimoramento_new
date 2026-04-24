export const ACCESS_TYPES = {
    aluno: "aluno",
    admin: "admin",
    secretaria: "secretaria",
    diretor: "diretor"
};

export const TOKEN_KEYS = {
    [ACCESS_TYPES.aluno]: "bolsaAprimora",
    [ACCESS_TYPES.admin]: "bolsaAprimoramentoAdmin",
    [ACCESS_TYPES.secretaria]: "bolsaAprimoramentoSecretaria",
    [ACCESS_TYPES.diretor]: "bolsaAprimoramentoDiretor"
};

export const STORAGE_KEYS = {
    alunoDados: "bolsaAprimoramentoAlunoDados"
};

export const LOGIN_ROUTES = {
    [ACCESS_TYPES.aluno]: "/login",
    [ACCESS_TYPES.admin]: "/admin/login",
    [ACCESS_TYPES.secretaria]: "/secretaria/login",
    [ACCESS_TYPES.diretor]: "/diretor/login"
};

export const HOME_ROUTES = {
    [ACCESS_TYPES.aluno]: "/",
    [ACCESS_TYPES.admin]: "/admin",
    [ACCESS_TYPES.secretaria]: "/secretaria",
    [ACCESS_TYPES.diretor]: "/diretor"
};

export const getAccessTypeByPath = (pathname = "") => {
    if (pathname.startsWith("/admin")) {
        return ACCESS_TYPES.admin;
    }

    if (pathname.startsWith("/secretaria")) {
        return ACCESS_TYPES.secretaria;
    }

    if (pathname.startsWith("/diretor")) {
        return ACCESS_TYPES.diretor;
    }

    return ACCESS_TYPES.aluno;
};

export const getStoredToken = (accessType) => {
    if (accessType === "any") {
        return Object.values(TOKEN_KEYS).find((tokenKey) => localStorage.getItem(tokenKey));
    }

    const tokenKey = TOKEN_KEYS[accessType];
    return tokenKey ? localStorage.getItem(tokenKey) : null;
};

const parseJwtPayload = (token) => {
    try {
        const payload = token.split('.')[1];

        if (!payload) {
            return null;
        }

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

export const getStoredTokenPayload = (accessType = "any") => {
    const token = getStoredToken(accessType);
    return token ? parseJwtPayload(token) : null;
};

export const getStoredMatricula = (accessType = ACCESS_TYPES.any) => {
    const payload = getStoredTokenPayload(accessType);

    if (!payload) {
        return null;
    }

    return payload.matricula ?? payload.username ?? payload.sub ?? null;
};

export const clearStoredToken = (accessType) => {
    const tokenKey = TOKEN_KEYS[accessType];

    if (tokenKey) {
        localStorage.removeItem(tokenKey);
    }
};

export const getStoredAlunoData = () => {
    const storedData = localStorage.getItem(STORAGE_KEYS.alunoDados);

    if (!storedData) {
        return null;
    }

    try {
        return JSON.parse(storedData);
    } catch {
        localStorage.removeItem(STORAGE_KEYS.alunoDados);
        return null;
    }
};

export const setStoredAlunoData = (dadosAluno) => {
    localStorage.setItem(STORAGE_KEYS.alunoDados, JSON.stringify(dadosAluno));
};

export const clearStoredAlunoData = () => {
    localStorage.removeItem(STORAGE_KEYS.alunoDados);
};

export const clearAccessSession = (accessType) => {
    clearStoredToken(accessType);

    if (accessType === ACCESS_TYPES.aluno) {
        clearStoredAlunoData();
    }
};