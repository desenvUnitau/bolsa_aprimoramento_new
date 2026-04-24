import { useEffect, useState } from "react";
import { FileEarmarkText, InfoCircle } from "react-bootstrap-icons";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { ACCESS_TYPES, getStoredMatricula } from "../../config/auth";
import { api } from "../../config/api";
import AdminPagination from "../admin/AdminPagination";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PAGE_SIZE = 10;

const getAprovaDiretorBadge = (aprovaDiretor) => {
  if (aprovaDiretor === 1) {
    return { label: 'Deferido', className: 'badge bg-success' };
  }
  if (aprovaDiretor === 0) {
    return { label: 'Indeferido', className: 'badge bg-danger' };
  }
  return { label: 'Não analisado', className: 'badge bg-secondary' };
};

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

export default function MinhasRequisicoesSecretaria() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [secretariaMatricula, setSecretariaMatricula] = useState(null);

  useEffect(() => {
    const matricula = getStoredMatricula(ACCESS_TYPES.secretaria);
    setSecretariaMatricula(matricula);

    const fetchRequests = async () => {
      if (!matricula) {
        toast.error('Não foi possível recuperar a matrícula da secretaria.');
        return;
      }

      setLoading(true);

      try {
        const response = await api.get(`/requisicoes/buscarAllRequisicacoesPorUsuario/${matricula}`, {
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
        console.error('Erro ao carregar minhas requisições', error);
        toast.error('Não foi possível carregar suas requisições.');
        setRequests([]);
        setTotalPages(1);
        setTotalElements(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [page]);

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
            <h1 className="admin-dashboard-panel-title admin-list-title">Minhas Requisições</h1>
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
                <th>Data de Solicitação</th>
                <th>Análise do Diretor</th>
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
                    <td>{formatDateTime(item.dataRequisicao)}</td>
                    <td>
                      {(() => {
                        const badge = getAprovaDiretorBadge(item.aprovaDiretor);
                        return <span className={badge.className}>{badge.label}</span>;
                      })()}
                    </td>
                    <td>
                        <div className="d-flex">
                            <OverlayTrigger placement="top" overlay={<Tooltip>Gerar relatório PDF</Tooltip>}>
                                <button type="button" className="btn btn-sm btn-outline-secondary"
                                  onClick={() => generateRequisicaoPdf(item)}>
                                    <FileEarmarkText size={16} />
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
