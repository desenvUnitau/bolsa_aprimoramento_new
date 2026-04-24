import { BarChartLine, CheckCircle, Clipboard2Check, ExclamationCircle, People } from "react-bootstrap-icons";

export default function AdminHome() {
    const summaryCards = [
        {
            title: "Solicitações",
            value: 0,
            description: "Alunos que pediram bolsa",
            icon: People,
            accentClass: "dashboard-card-primary"
        },
        {
            title: "Deferidas",
            value: 0,
            description: "Solicitações aprovadas",
            icon: CheckCircle,
            accentClass: "dashboard-card-success"
        },
        {
            title: "Indeferidas",
            value: 0,
            description: "Solicitações recusadas",
            icon: ExclamationCircle,
            accentClass: "dashboard-card-danger"
        },
        {
            title: "Com Diretores",
            value: 0,
            description: "Em análise com direção",
            icon: Clipboard2Check,
            accentClass: "dashboard-card-warning"
        }
    ];

    return (
        <section className="admin-dashboard">
            <div className="admin-dashboard-hero">
                <div>
                    <p className="admin-dashboard-kicker mb-2">Painel administrativo</p>
                    <h1 className="admin-dashboard-title mb-2">Resumo das bolsas</h1>
                    <p className="admin-dashboard-subtitle mb-0">
                        Acompanhe rapidamente o volume de solicitações e o status atual das análises.
                    </p>
                </div>
                <div className="admin-dashboard-badge">
                    <BarChartLine size={20} />
                    <span>Home do dashboard</span>
                </div>
            </div>

            <div className="row g-3 mt-1">
                {summaryCards.map(({ title, value, description, icon: Icon, accentClass }) => (
                    <div className="col-xl-3 col-md-6" key={title}>
                        <article className={`admin-dashboard-card ${accentClass}`}>
                            <div className="admin-dashboard-card-head">
                                <div>
                                    <p className="admin-dashboard-card-label mb-1">{title}</p>
                                    <h2 className="admin-dashboard-card-value mb-1">{value}</h2>
                                </div>
                                <div className="admin-dashboard-card-icon">
                                    <Icon size={22} />
                                </div>
                            </div>
                            <p className="admin-dashboard-card-description mb-0">{description}</p>
                        </article>
                    </div>
                ))}
            </div>

            <div className="admin-dashboard-panel mt-4">
                <h2 className="admin-dashboard-panel-title">Leitura rápida</h2>
                <div className="row g-3 mt-1">
                    <div className="col-lg-6">
                        <div className="admin-dashboard-note">
                            <strong>Total de pedidos</strong>
                            <span>Monitora quantos alunos já solicitaram bolsa.</span>
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="admin-dashboard-note">
                            <strong>Status das análises</strong>
                            <span>Compare rapidamente o volume deferido, indeferido e pendente com os diretores.</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}