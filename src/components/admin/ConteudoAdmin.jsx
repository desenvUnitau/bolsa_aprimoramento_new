import { BarChartLine, CardChecklist, PeopleFill } from "react-bootstrap-icons";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import AdminHome from "./AdminHome";
import AdminSolicitacoes from "./AdminSolicitacoes";
import AlunosAdmin from "./AlunosAdmin";
import "../Conteudo.css";
import "./ConteudoAdmin.css";

export default function ConteudoAdmin() {
    return (
        <main className="conteudo-custom flex-grow-1">
            <div className="container py-2">
                <div className="admin-shell">
                    <nav className="admin-nav">
                        <NavLink end to="/admin" className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
                            <BarChartLine size={18} />
                            <span>Dashboard</span>
                        </NavLink>
                        <NavLink to="/admin/solicitacoes" className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
                            <CardChecklist size={18} />
                            <span>Solicitações</span>
                        </NavLink>
                        <NavLink to="/admin/alunos" className={({ isActive }) => `admin-nav-link ${isActive ? "admin-nav-link-active" : ""}`}>
                            <PeopleFill size={18} />
                            <span>Alunos</span>
                        </NavLink>
                    </nav>

                    <div className="admin-content">
                <Routes>
                    <Route path="/" element={<AdminHome />} />
                    <Route path="/solicitacoes" element={<AdminSolicitacoes />} />
                    <Route path="/alunos" element={<AlunosAdmin />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
                    </div>
                </div>
            </div>
        </main>
    );
}