import { useEffect, useMemo, useState } from "react";
import { Check2Circle, Funnel, InfoCircle, Search } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { api } from "../../config/api";
import AdminPagination from "./AdminPagination";
import Select from "react-select";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";

const INITIAL_FILTERS = {
    requisitante: "",
    aluno: "",
    responsavel: "",
    diretor: "",
    dataRequisicaoInicio: "",
    dataRequisicaoFim: "",
    manha: "",
    tarde: "",
    noite: "",
    deferimento: "",
    anoSemestre: ""
};

const PAGE_SIZE = 10;

const INTEGER_FILTER_KEYS = [
    "requisitante",
    "responsavel",
    "diretor",
    "manha",
    "tarde",
    "noite",
    "deferimento"
];

const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "-1", label: "Em análise" },
    { value: "0", label: "Indeferido" },
    { value: "1", label: "Deferido" }
];

const FLAG_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "0", label: "Não" },
    { value: "1", label: "Sim" }
];

const DEFERIMENTO_BADGES = {
    "-1": {
        label: "Em análise",
        className: "admin-status-badge-warning"
    },
    "0": {
        label: "Indeferido",
        className: "admin-status-badge-danger"
    },
    "1": {
        label: "Deferido",
        className: "admin-status-badge-success"
    }
};

const normalizeFilterValue = (key, value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    // Trata números
    if (INTEGER_FILTER_KEYS.includes(key)) {
        const numericValue = Number(value);
        return Number.isNaN(numericValue) ? undefined : numericValue;
    }

    // Trata strings
    if (typeof value === "string") {
        const trimmed = value.trim();
        return trimmed === "" ? undefined : trimmed;
    }

    return value;
};
const formatDate = (value) => {
    if (!value) return '-';
    const [year, month, day] = String(value).split('T')[0].split('-');
    return `${day}/${month}/${year}`;
};

const getDeferimentoBadge = (value) => {
    if (value === null || value === undefined) {
        return {
            label: "Sem análise",
            className: "admin-status-badge-neutral"
        };
    }

    const badge = DEFERIMENTO_BADGES[String(value)];

    if (!badge) {
        return {
            label: String(value),
            className: "admin-status-badge-neutral"
        };
    }

    return badge;
};

export default function AdminSolicitacoes() {
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(INITIAL_FILTERS);
    const [page, setPage] = useState(0);
    const [optionsAnoSemestre, setOptionsAnoSemestre] = useState([]);
    const [optionsUsuarios, setOptionsUsuarios] = useState([]);
    const [optionsDiretor, setOptionsDiretor] = useState([]);
    const [optionsSecretaria, setOptionsSecretaria] = useState([]);

    const [result, setResult] = useState({
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0
    });
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const loadSolicitacoes = async () => {
            setIsLoading(true);

            try {
                const params = {
                    page,
                    size: PAGE_SIZE
                };

                const requestBody = Object.fromEntries(
                    Object.entries(appliedFilters)
                        .map(([key, value]) => [key, normalizeFilterValue(key, value)])
                        .filter(([, value]) => value !== undefined)
                );

                console.log('Enviando requisição com filtros:', requestBody, 'e parâmetros:', params);

                const response = await api.post('/requisicoes/buscar', requestBody, { params });
                const responseData = response.data ?? {};

                setResult({
                    content: responseData.content ?? [],
                    totalElements: responseData.totalElements ?? 0,
                    totalPages: responseData.totalPages ?? 0,
                    number: responseData.number ?? 0
                });
            } catch (error) {
                console.error('Erro ao carregar solicitações', error);
                setResult({
                    content: [],
                    totalElements: 0,
                    totalPages: 0,
                    number: 0
                });
                toast.error('Não foi possível carregar as solicitações.');
            } finally {
                setIsLoading(false);
            }
        };

        loadSolicitacoes();
    }, [appliedFilters, page]);

    useEffect(() => {
        const loadAnoSemestreOptions = async () => {
            try {
                const response = await api.get('/alunoSemestre/anoSemestres');
                const options = response.data ?? [];
                setOptionsAnoSemestre(options);
            } catch (error) {
                console.error('Erro ao carregar opções de ano/semestre', error);
                toast.error('Não foi possível carregar as opções de ano/semestre.');
            }
        };

        const loadUsuario = async () => {
            try {
                const response = await api.get('/usuarios/todos/lista');
                setOptionsUsuarios(response.data.map((usuario) => ({
                    label: usuario.matricula + " - " + usuario.nomeUsuario,
                    value: usuario.idUsuario
                })));
            }catch (error) {
                console.error('Erro ao carregar dados do usuário', error);
                toast.error('Não foi possível carregar os dados do usuário.');
            }
        };

        const loadDiretor = async () => {
            try {
                const response = await api.get('/usuarios/todos/perfil/2');
                setOptionsDiretor(response.data.map((diretor) => ({
                    label: diretor.matricula + " - " + diretor.nomeUsuario,
                    value: diretor.idUsuario
                })));
            } catch (error) {
                console.error('Erro ao carregar dados do diretor', error);
                toast.error('Não foi possível carregar os dados do diretor.');
            }
        };

        const loadSecretaria = async () => {
            try {                const response = await api.get('/usuarios/todos/perfil/3');
                setOptionsSecretaria(response.data.map((secretaria) => ({
                    label: secretaria.matricula + " - " + secretaria.nomeUsuario,
                    value: secretaria.idUsuario
                })));
            }catch (error) {
                console.error('Erro ao carregar dados da secretaria', error);
                toast.error('Não foi possível carregar os dados da secretaria.')
            }
        }

        loadAnoSemestreOptions();
        loadUsuario();
        loadDiretor();
        loadSecretaria();
    }, []);

    const activeFilterCount = useMemo(
        () => Object.values(appliedFilters).filter(Boolean).length,
        [appliedFilters]
    );

    const handleFilterChange = ({ target }) => {
        const { name, value } = target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value
        }));
    };

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(0);
        setAppliedFilters(filters);
    };

    const handleClear = () => {
        setFilters(INITIAL_FILTERS);
        setAppliedFilters(INITIAL_FILTERS);
        setPage(0);
    };

    const handleConfirmationInformation = (item) => {
        setSelectedItem(item);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedItem(null);
    };

    return (
        <>
        <section className="admin-dashboard">
            <div className="admin-dashboard-panel">
                <div className="admin-list-header">
                    <div>
                        <p className="admin-dashboard-kicker admin-dashboard-kicker-dark mb-2">Solicitações</p>
                        <h1 className="admin-dashboard-panel-title admin-list-title">Lista de solicitações</h1>
                    </div>
                    <div className="admin-list-pill">
                        {activeFilterCount > 0 ? `${activeFilterCount} filtro(s) ativo(s)` : 'Todos os pedidos'}
                    </div>
                </div>

                <form className="admin-filter-grid mt-3" onSubmit={handleSearch}>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-anoSemestre">Ano/Semestre</label>
                        <select id="filter-anoSemestre" name="anoSemestre" className="form-select" 
                            value={filters.anoSemestre} onChange={handleFilterChange}>
                            <option value="">Todos</option>
                            {optionsAnoSemestre.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-requisitante">Requisitante</label>
                        {/* <input id="filter-requisitante" name="requisitante" type="number" className="form-control" value={filters.requisitante} onChange={handleFilterChange} /> */}
                        <Select
                            id="filter-requisitante"
                            name="requisitante"
                            options={optionsUsuarios}
                            value={optionsUsuarios.find(option => option.value === filters.requisitante)}
                            onChange={(selectedOption) => setFilters((currentFilters) => ({
                                ...currentFilters,
                                requisitante: selectedOption ? selectedOption.value : ''
                            }))}
                            isClearable
                        />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-aluno">Aluno</label>
                        <input id="filter-aluno" name="aluno" type="text" className="form-control" value={filters.aluno} onChange={handleFilterChange} />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-responsavel">Responsável</label>
                        {/* <input id="filter-responsavel" name="responsavel" type="number" className="form-control" value={filters.responsavel} onChange={handleFilterChange} /> */}
                        <Select 
                            id="filter-responsavel"
                            name="responsavel"
                            options={optionsSecretaria}
                            value={optionsSecretaria.find(option => option.value === filters.responsavel)}
                            onChange={(selectedOption) => setFilters((currentFilters)=>({
                                ...currentFilters,
                                responsavel: selectedOption ? selectedOption.value: ''
                            }))}
                            isClearable
                        />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-diretor">Diretor</label>
                        <Select
                            id="filter-diretor"
                            name="diretor"
                            options={optionsDiretor}
                            value={optionsDiretor.find(option => option.value === filters.diretor)}
                            onChange={(selectedOption) => setFilters((currentFilters) => ({
                                ...currentFilters,
                                diretor: selectedOption ? selectedOption.value : ''
                            }))}
                            isClearable
                        />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-data-inicio">Data requisição início</label>
                        <input id="filter-data-inicio" name="dataRequisicaoInicio" type="datetime-local" className="form-control" value={filters.dataRequisicaoInicio} onChange={handleFilterChange} />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-data-fim">Data requisição fim</label>
                        <input id="filter-data-fim" name="dataRequisicaoFim" type="datetime-local" className="form-control" value={filters.dataRequisicaoFim} onChange={handleFilterChange} />
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-manha">Período manhã</label>
                        <select id="filter-manha" name="manha" className="form-select" value={filters.manha} onChange={handleFilterChange}>
                            {FLAG_OPTIONS.map((option) => (
                                <option key={option.label} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-tarde">Período tarde</label>
                        <select id="filter-tarde" name="tarde" className="form-select" value={filters.tarde} onChange={handleFilterChange}>
                            {FLAG_OPTIONS.map((option) => (
                                <option key={option.label} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-noite">Período noite</label>
                        <select id="filter-noite" name="noite" className="form-select" value={filters.noite} onChange={handleFilterChange}>
                            {FLAG_OPTIONS.map((option) => (
                                <option key={option.label} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-filter-field">
                        <label htmlFor="filter-deferimento">Deferimento</label>
                        <select id="filter-deferimento" name="deferimento" className="form-select" value={filters.deferimento} onChange={handleFilterChange}>
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option.label} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-filter-actions">
                        <button type="submit" className="btn btn-custom admin-filter-button">
                            <Search size={16} />
                            <span>Buscar</span>
                        </button>
                        <button type="button" className="btn btn-outline-secondary admin-filter-button" onClick={handleClear}>
                            <Funnel size={16} />
                            <span>Limpar</span>
                        </button>
                    </div>
                </form>

                <div className="admin-list-meta mt-3">
                    <span>{result.totalElements} solicitação(ões) encontrada(s)</span>
                    <span>Página {result.number + 1} de {Math.max(result.totalPages, 1)}</span>
                </div>

                <div className="admin-list-table-wrap mt-3">
                    <table className="admin-list-table">
                        <thead>
                            <tr>
                                <th>Requisição</th>
                                <th>Aluno</th>
                                <th>RA</th>
                                <th>CPF</th>
                                <th>Modalidade</th>
                                <th>Departamento</th>
                                <th>Sexo</th>
                                <th>Curso</th>
                                <th>Deferimento</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan="10" className="admin-list-empty">Carregando solicitações...</td>
                                </tr>
                            ) : null}

                            {!isLoading && result.content.length === 0 ? (
                                <tr>
                                    <td colSpan="10" className="admin-list-empty text-center">
                                        Nenhuma solicitação encontrada.
                                    </td>
                                </tr>
                            ) : null}

                            {!isLoading && result.content.map((item, index) => {
                                const deferimentoBadge = getDeferimentoBadge(item.deferimento);

                                return (
                                    <tr key={`${item.idRequisicao ?? 'sem-id'}-${index}`}>
                                        <td>{item.idRequisicao ?? '-'}</td>
                                        <td>{item.aluno?.aluno?.nome ?? '-'}</td>
                                        <td>{item.aluno?.aluno?.ra ?? '-'}</td>
                                        <td>{item.aluno?.aluno?.cpf ?? '-'}</td>
                                        <td>{item.modalidade?.descricaoModalidade ?? '-'}</td>
                                        <td>{item.idDepartamento ?? '-'}</td>
                                        <td>{item.aluno?.aluno?.sexo ?? '-'}</td>
                                        <td>{item.aluno?.aluno?.descricaoCurso ?? '-'}</td>
                                        <td>
                                            <span className={`admin-status-badge ${deferimentoBadge.className}`}>
                                                {deferimentoBadge.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="admin-table-actions d-flex">
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Clique para verificar as informações do aluno</Tooltip>}>
                                                    <button className="btn btn-sm btn-primary" onClick={() => handleConfirmationInformation(item)}>
                                                        <InfoCircle />
                                                    </button>
                                                </OverlayTrigger>
                                                <OverlayTrigger placement="top" overlay={<Tooltip>Clique para aprovar a requisição</Tooltip>}>
                                                    <button className="btn btn-sm btn-success ms-2">
                                                        <Check2Circle />
                                                    </button>
                                                </OverlayTrigger>
                                            </div>
                                            {/* Ações futuras, como visualizar detalhes, editar, etc. */}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-3 d-flex justify-content-end">
                    <AdminPagination
                        currentPage={page}
                        totalPages={result.totalPages}
                        disabled={isLoading}
                        onPageChange={setPage}
                    />
                </div>
            </div>
        </section>

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>Detalhes da Solicitação</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {selectedItem && (
                    <>
                        <h6 className="text-muted fw-semibold mb-2">Dados do Aluno</h6>
                        <div className="row g-2 mb-4">
                            <div className="col-sm-6">
                                <small className="text-muted d-block">Nome</small>
                                <span>{selectedItem.aluno?.aluno?.nome ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">RA</small>
                                <span>{selectedItem.aluno?.aluno?.ra ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">CPF</small>
                                <span>{selectedItem.aluno?.aluno?.cpf ?? '-'}</span>
                            </div>
                            <div className="col-sm-6">
                                <small className="text-muted d-block">Data de Nascimento</small>
                                <span>{formatDate(selectedItem.aluno?.aluno?.dataNascimento)}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Curso</small>
                                <span>{selectedItem.aluno?.aluno?.descricaoCurso ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Sexo</small>
                                <span>{selectedItem.aluno?.aluno?.sexo ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Raça/etnia</small>
                                <span>{selectedItem.aluno?.aluno?.racaEtnia?.descricaoRaca ?? '-'}</span>
                            </div>
                            
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Estado Civil</small>
                                <span>{selectedItem.aluno?.aluno?.estCivilAl?.descricaoEstCivil ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Turno</small>
                                <span>{selectedItem.aluno?.aluno?.turno ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">fase</small>
                                <span>{selectedItem.aluno?.aluno?.fase ?? '-'}</span>
                            </div>
                            <div className="col-sm-6">
                                <small className="text-muted d-block">Endereço</small>
                                <span>{selectedItem.aluno?.aluno?.endereco ?? '-'}</span>
                            </div>
                            <div className="col-sm-2">
                                <small className="text-muted d-block">Número</small>
                                <span>{selectedItem.aluno?.aluno?.numero ?? '-'}</span>
                            </div>
                            <div className="col-sm-4">
                                <small className="text-muted d-block">Bairro</small>
                                <span>{selectedItem.aluno?.aluno?.bairro ?? '-'}</span>
                            </div>
                            <div className="col-sm-6">
                                <small className="text-muted d-block">E-mail</small>
                                <span>{selectedItem.aluno?.aluno?.email ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Telefone</small>
                                <span>{selectedItem.aluno?.aluno?.telefone ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Celular</small>
                                <span>{selectedItem.aluno?.aluno?.celular ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Deficiência</small>
                                <span>{selectedItem.aluno?.aluno?.deficiencia?.descricaoDefic ?? '-'}</span>
                            </div>
                        </div>

                        <hr />

                        <h6 className="text-muted fw-semibold mb-2">Dados do Semestre</h6>
                        <div className="row g-2">
                           
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Ano/Semestre</small>
                                <span>{selectedItem.aluno?.anoSemestre ?? '-'}</span>
                            </div>
                            
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Deferimento</small>
                                <span className={`admin-status-badge ${getDeferimentoBadge(selectedItem.deferimento).className}`}>
                                    {getDeferimentoBadge(selectedItem.deferimento).label}
                                </span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block mb-1">Disponibilidade</small>
                                <div className="d-flex gap-2">
                                    {selectedItem.aluno?.disponibilidadeManha === 1 && <span className="badge bg-info">Manhã</span>}
                                    {selectedItem.aluno?.disponibilidadeTarde === 1 && <span className="badge bg-primary">Tarde</span>}
                                    {selectedItem.aluno?.disponibilidadeNoite === 1 && <span className="badge bg-dark">Noite</span>}
                                    {selectedItem.aluno?.disponibilidadeManha !== 1 && selectedItem.aluno?.disponibilidadeTarde !== 1 && selectedItem.aluno?.disponibilidadeNoite !== 1 && (
                                        <span className="text-muted">Nenhum período disponível</span>
                                    )}
                                </div>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block mb-1">Hab. Atend. Público</small>
                                <div className="d-flex gap-2">
                                    {selectedItem.aluno?.habilidadeAtendPublic === 1 ? <span className="badge bg-success">Sim</span> 
                                        :
                                        (selectedItem.aluno?.habilidadeAtendPublic === 0 ? <span className="badge bg-secondary">Não</span> : 
                                            <span className="text-muted">Sem Resposta</span>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="col-sm-12">
                                <small className="text-muted d-block mb-1">Curso Extracurrillar</small>
                                <span>{selectedItem?.aluno?.cursoExtraCurricular ?? '-'}</span>
                            </div>
                            <div className="col-sm-12">
                                <small className="text-muted d-block mb-1">Experiência Profissional</small>
                                <span>{selectedItem.aluno?.experienciaCurricular ?? '-'}</span>
                            </div>
                        </div>
                        <hr />

                        <h6 className="text-muted fw-semibold mb-2">Dados da Requisição</h6>
                        <div className="row g-2">
                             <div className="col-sm-3">
                                <small className="text-muted d-block">Nº Requisição</small>
                                <span>{selectedItem.idRequisicao ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Modalidade</small>
                                <span>{selectedItem.modalidade?.descricaoModalidade ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Departamento</small>
                                <span>{selectedItem.idDepartamento ?? '-'}</span>
                            </div>
                            <div className="col-sm-3">
                                <small className="text-muted d-block">Data da Requisição</small>
                                <span>
                                    {selectedItem.dataRequisicao
                                        ? new Date(selectedItem.dataRequisicao).toLocaleString('pt-BR')
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <button className="btn btn-secondary" onClick={handleCloseModal}>Fechar</button>
            </Modal.Footer>
        </Modal>
        </>
    );
}