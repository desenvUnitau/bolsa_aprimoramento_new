import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import DiretorHome from "./DiretorHome";
import RequisicoesDiretor from "./RequisicoesDiretor";
import RequisicoesAprovadasDiretor from "./RequisicoesAprovadasDiretor";
import "../Conteudo.css";

export default function ConteudoDiretor() {
  return (
    <main className="conteudo-custom flex-grow-1">
      <div className="container py-2">
        <div className="admin-shell">
          <nav className="admin-nav">
            <NavLink
              end
              to="/diretor"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Home</span>
            </NavLink>
            <NavLink
              end
              to="/diretor/requisicoes"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Requisições</span>
            </NavLink>
            <NavLink
              end
              to="/diretor/requisicoesAprovadas"
              className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
              <span>Requisições Aprovadas</span>
            </NavLink>
          </nav>

          <div className="admin-content">
            <Routes>
              <Route path="/" element={<DiretorHome />} />
              <Route path="/requisicoes" element={<RequisicoesDiretor />} />
              <Route path="/requisicoesAprovadas" element={<RequisicoesAprovadasDiretor />} />
              <Route path="*" element={<Navigate to="/diretor" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </main>
  );
}