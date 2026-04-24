import { useEffect, useState } from "react";
import { FileEarmarkText, InfoCircle, SendCheckFill } from "react-bootstrap-icons";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ACCESS_TYPES, getStoredMatricula } from "../../config/auth";
import { api } from "../../config/api";
import AdminPagination from "../admin/AdminPagination";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PAGE_SIZE = 10;

const INTEGER_FILTER_KEYS = [
  "manha",
  "tarde",
  "noite",
  "deferimento"
];

const getDeferimentoBadge = (requisicao) => {
  if (requisicao.deferimento === 1) {
    return { label: 'Deferido', className: 'badge bg-success' };
  }

  if (requisicao.deferimento === 0) {
    return { label: 'Indeferido', className: 'badge bg-danger' };
  }

  if(requisicao.deferimento === -1 && requisicao.usuarioRequisitante) {
    return { label: 'Em análise', className: 'badge bg-secondary' };
  }
  return { label: 'Sem requisitante', className: 'badge bg-warning text-dark' };
};

const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const addPdfHeader = async (doc, orientation = 'portrait') => {
  const imageUrl = '/img/logo_vertical.png';
  let imageData = null;

  try {
    imageData = await getBase64FromUrl(imageUrl);
  } catch (error) {
    console.error('Não foi possível carregar o logo para o PDF', error);
  }

  const margin = 40;
  const imageWidth = orientation === 'landscape' ? 70 : 50;
  const imageHeight = orientation === 'landscape' ? 80 : 60;
  const textX = margin + imageWidth + 15;
  const textY = margin + 12;

  if (imageData) {
    doc.addImage(imageData, 'PNG', margin, margin, imageWidth, imageHeight);
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Universidade de Taubaté', textX, textY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text([
    'Autarquia Municipal de Regime Especial',
    'Reconhecida pelo Dec. Fed. n 78.924/76',
    'Recredenciada pelo CEE/SP',
    'CNPJ 45.176.153/0001-22'
  ], textX, textY + 18);

  return margin + imageHeight + 25;
};

export default function RequisicoesSecretaria() {
  const [requests, setRequests] = useState([]);
  const [filters, setFilters] = useState({
    anoSemestre: "",
    aluno: "",
    manha: "",
    tarde: "",
    noite: "",
    deferimento: ""
  });
  const [searchFilters, setSearchFilters] = useState({
    anoSemestre: "",
    aluno: "",
    manha: "",
    tarde: "",
    noite: "",
    deferimento: ""
  });
  const [optionsAnoSemestre, setOptionsAnoSemestre] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [secretariaMatricula, setSecretariaMatricula] = useState(null);
  

  useEffect(() => {
    const matricula = getStoredMatricula(ACCESS_TYPES.secretaria);
    setSecretariaMatricula(matricula);

    const fetchRequests = async () => {
      setLoading(true);

      try {
        const body = Object.fromEntries(
          Object.entries(searchFilters)
            .map(([key, value]) => {
              if (value === "" || value === null || value === undefined) {
                return [key, undefined];
              }

              if (INTEGER_FILTER_KEYS.includes(key)) {
                const numericValue = Number(value);
                return [key, Number.isNaN(numericValue) ? undefined : numericValue];
              }

              return [key, value];
            })
            .filter(([, value]) => value !== undefined)
        );

        const response = await api.post('/requisicoes/buscarByAllPersonavelForSecretaria', body, {
          params: {
            page,
            size: PAGE_SIZE
          }
        });

        const responseData = response.data ?? {};
        const content = Array.isArray(responseData.content) ? responseData.content : [];

        setRequests(content);
        setTotalPages(responseData.totalPages ?? 1);
        setTotalElements(responseData.totalElements ?? 0);
      } catch (error) {
        console.error('Erro ao carregar requisições', error);
        toast.error('Não foi possível carregar as requisições da secretaria.');
        setRequests([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page, searchFilters]);

  useEffect(() => {
    const loadAnoSemestreOptions = async () => {
      try {
        const response = await api.get('/alunos/buscarAnoSemestres');
        setOptionsAnoSemestre(response.data ?? []);
      } catch (error) {
        console.error('Erro ao carregar opções de ano/semestre', error);
        toast.error('Não foi possível carregar as opções de ano/semestre.');
      }
    };

    loadAnoSemestreOptions();
  }, []);

  const handleSolicitacaoAluno = async (requisicao) => {
    const result = await Swal.fire({
      title: 'Confirmar solicitação',
      text: `Deseja concluir a solicitação do aluno ${requisicao.aluno?.nome ?? ''}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, solicitar',
      cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await api.put(`/requisicoes/solicitarAluno/${requisicao.idRequisicao}?matricula=${getStoredMatricula(ACCESS_TYPES.secretaria)}`);
      toast.success('Solicitação do aluno realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao processar solicitação do aluno', error);
      toast.error('Não foi possível processar a solicitação do aluno. Tente novamente.');
    }
  };

  const formatDateTime = (value) => {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  const generateRequisicaoPdf = async (requisicao) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const startY = await addPdfHeader(doc, 'portrait');
    const margin = 40;
    const lineHeight = 18;
    let y = startY;

    doc.setFontSize(18);
    doc.text('Relatório da Requisição', margin, y);

    y += 28;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const fields = [
      ['ID Requisição', requisicao.idRequisicao ?? '-'],
      ['Aluno', requisicao.aluno?.nome ?? '-'],
      ['RA', requisicao.aluno?.ra ?? '-'],
      ['CPF', requisicao.aluno?.cpf ?? '-'],
      ['Curso', requisicao.aluno?.descricaoCurso ?? requisicao.aluno?.curso ?? '-'],
      ['Modalidade', requisicao.modalidade?.descricaoModalidade ?? '-'],
      ['Status', requisicao.deferimento === 1 ? 'Deferido' : requisicao.deferimento === 0 ? 'Indeferido' : 'Em análise'],
      ['Motivo do indeferimento', requisicao.motivoIndeferimento ?? '-'],
      ['Data de solicitação', formatDateTime(requisicao.dataRequisicao)],
      ['Solicitante', requisicao.usuarioRequisitante?.nomeUsuario ?? '-'],
      ['Matrícula solicitante', requisicao.usuarioRequisitante?.matricula ?? '-']
    ];

    const labelWidth = 150;
    const valueWidth = doc.internal.pageSize.getWidth() - margin * 2 - labelWidth;

    fields.forEach(([label, value]) => { 
      const text = String(value ?? '-');
      const lines = doc.splitTextToSize(text, valueWidth);
      const blockHeight = Math.max(lineHeight, lines.length * 14 + 4);

      if (y + blockHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, margin, y + 12);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, margin + labelWidth, y + 12);
      y += blockHeight + 6;
    });

    doc.save(`Relatorio_Requisicao_${requisicao.idRequisicao ?? 'sem-id'}.pdf`);
  };

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-panel">
        <div className="admin-list-header">
          <div>
            <p className="admin-dashboard-kicker admin-dashboard-kicker-dark mb-2">Secretaria</p>
            <h1 className="admin-dashboard-panel-title admin-list-title">Requisições</h1>
            {secretariaMatricula ? (
              <p className="text-muted mb-0">Matrícula da sessão: {secretariaMatricula}</p>
            ) : null}
          </div>
          <div className="admin-list-pill">
            {loading
              ? 'Carregando...'
              : `${totalElements} requisição(ões) encontrada(s)`}
          </div>
        </div>
        <div className="admin-list-description">
          <form
            className="row gx-2 gy-2 align-items-end"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(0);
              setSearchFilters(filters);
            }}
          >
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-anoSemestre">Ano/Semestre</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Busca por ano e semestre da requisição</Tooltip>}>
                <select
                  id="filter-anoSemestre"
                  name="anoSemestre"
                  className="form-select form-select-sm"
                  value={filters.anoSemestre}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    anoSemestre: event.target.value
                  }))}
                >
                  <option value="">Todos</option>
                  {optionsAnoSemestre.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>              
              </OverlayTrigger>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-aluno">Aluno</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Busca por nome do aluno</Tooltip>}>
                <input
                  id="filter-aluno"
                  name="aluno"
                  type="text"
                  className="form-control form-control-sm"
                  value={filters.aluno}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    aluno: event.target.value
                  }))}
                  placeholder="Digite o nome do Aluno"
                />              
              </OverlayTrigger>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-manha">Manhã</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Filtra requisições que solicitam atendimento no período da manhã</Tooltip>}>
                <select
                  id="filter-manha"
                  name="manha"
                  className="form-select form-select-sm"
                  value={filters.manha}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    manha: event.target.value
                  }))}
                >
                  <option value="">Todos</option>
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </OverlayTrigger>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-tarde">Tarde</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Filtra requisições que solicitam atendimento no período da tarde</Tooltip>}>
                <select
                  id="filter-tarde"
                  name="tarde"
                  className="form-select form-select-sm"
                  value={filters.tarde}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    tarde: event.target.value
                  }))}
                >
                  <option value="">Todos</option>
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </OverlayTrigger>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-noite">Noite</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Filtra requisições que solicitam atendimento no período da noite</Tooltip>}>
                <select
                  id="filter-noite"
                  name="noite"
                  className="form-select form-select-sm"
                  value={filters.noite}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    noite: event.target.value
                  }))}
                >
                  <option value="">Todos</option>
                  <option value="0">Não</option>
                  <option value="1">Sim</option>
                </select>
              </OverlayTrigger>
            </div>
            <div className="col-12 col-sm-6 col-md-4 col-xl-3">
              <label className="form-label small" htmlFor="filter-deferimento">Deferimento</label>
              <OverlayTrigger placement="top" overlay={<Tooltip>Filtra requisições com base no deferimento</Tooltip>}>
                <select
                  id="filter-deferimento"
                  name="deferimento"
                  className="form-select form-select-sm"
                  value={filters.deferimento}
                  onChange={(event) => setFilters((current) => ({
                    ...current,
                    deferimento: event.target.value
                  }))}
                >
                  <option value="">Todos</option>
                  <option value="-1">Em análise</option>
                  <option value="0">Indeferido</option>
                  <option value="1">Deferido</option>
                </select>
              </OverlayTrigger>
            </div>
            <div className="col-12 d-flex gap-2 justify-content-end">
              <OverlayTrigger placement="top" overlay={<Tooltip>Aplicar filtros de busca</Tooltip>}>
                <button type="submit" className="btn btn-primary btn-sm">Buscar</button>
              </OverlayTrigger>
              <OverlayTrigger placement="top" overlay={<Tooltip>Limpar filtros</Tooltip>}>
                <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setFilters({
                        anoSemestre: "",
                        aluno: "",
                        manha: "",
                        tarde: "",
                        noite: "",
                      deferimento: ""
                    });
                    setSearchFilters({
                      anoSemestre: "",
                      aluno: "",
                      manha: "",
                      tarde: "",
                      noite: "",
                      deferimento: ""
                    });
                    setPage(0);
                    }}
                  >
                  Limpar
                </button>
              </OverlayTrigger>
            </div>
          </form>
        </div>

        <div className="table-responsive mt-4">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Aluno</th>
                <th>RA</th>
                <th>CPF</th>
                <th>Curso</th>
                <th>Modalidade</th>
                <th>Status</th>
                <th>Motivo do indeferimento</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    Carregando requisições...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    Nenhuma requisição encontrada.
                  </td>
                </tr>
              ) : (
                requests.map((item, index) => (
                  <tr key={`${item.idRequisicao ?? 'sem-id'}-${index}`}>
                    <td>{item.idRequisicao ?? '-'}</td>
                    <td>{item.aluno?.nome ?? '-'}</td>
                    <td>{item.aluno?.ra ?? '-'}</td>
                    <td>{item.aluno?.cpf ?? '-'}</td>
                    <td>{item.aluno?.descricaoCurso ?? item.aluno?.curso ?? '-'}</td>
                    <td>{item.modalidade?.descricaoModalidade ?? '-'}</td>
                    <td>
                      {(() => {
                        const badge = getDeferimentoBadge(item);
                        return <span className={badge.className}>{badge.label}</span>;
                      })()}
                    </td>
                    <td>{item.motivoIndeferimento ?? '-'}</td>
                    <td>
                        <div className="d-flex">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Gerar relatório PDF</Tooltip>}>
                                <button type="button" className="btn btn-sm btn-outline-secondary mx-1"
                                  onClick={() => generateRequisicaoPdf(item)}>
                                    <FileEarmarkText size={16} />
                                </button>
                            </OverlayTrigger>
                            <OverlayTrigger placement="top" overlay={<Tooltip>Solicitar aluno</Tooltip>}>
                                <button type="button" className="btn btn-sm btn-outline-primary"
                                onClick={()=> handleSolicitacaoAluno(item)}>
                                    <SendCheckFill size={16} />
                                </button>
                            </OverlayTrigger>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 d-flex justify-content-between align-items-center">
          <div>
            {loading
              ? 'Carregando resultados...'
              : `${totalElements} registro(s) no total`}
          </div>
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            disabled={loading}
            onPageChange={(nextPage) => setPage(nextPage)}
          />
        </div>
      </div>
    </section>
  );
}
