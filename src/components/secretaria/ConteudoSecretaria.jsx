import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import SecretariaHome from "./SecretariaHome";
import AlunosSecretaria from "./AlunosSecretaria";
import "../Conteudo.css";
import RequisicoesSecretaria from "./RequisicoesSecretaria";
import MinhasRequisicoesSecretaria from "./MinhasRequisicoesSecretaria";

export default function ConteudoSecretaria() {
  return (
    <main className="conteudo-custom flex-grow-1">
      <div className="container py-2">
        <div className="admin-shell">
          <nav className="admin-nav">
            <NavLink
              end
              to="/secretaria"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Home</span>
            </NavLink>
            <NavLink
              end
              to="/secretaria/alunos"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Alunos</span>
            </NavLink>
            <NavLink
              end
              to="/secretaria/requisicoes"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Requisições</span>
            </NavLink>
            <NavLink
              end
              to="/secretaria/minhasRequisicoes"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Minhas Requisições</span>
            </NavLink>
          </nav>

          <div className="admin-content">
            <Routes>
              <Route path="/" element={<SecretariaHome />} />
              <Route path="/alunos" element={<AlunosSecretaria />} />
              <Route path="/requisicoes" element={<RequisicoesSecretaria />} />
              <Route path="/minhasRequisicoes" element={<MinhasRequisicoesSecretaria />} />
              <Route path="*" element={<Navigate to="/secretaria" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </main>
  );
}
