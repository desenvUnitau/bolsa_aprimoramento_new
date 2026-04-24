import { useEffect, useMemo, useState } from "react";
import { InfoCircle, Search } from "react-bootstrap-icons";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AdminPagination from "./AdminPagination";
import { api } from "../../config/api";

const PAGE_SIZE = 10;

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const json = decodeURIComponent(
      decoded.split('').map((c) => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`).join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export default function AlunosAdmin() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSemestres, setLoadingSemestres] = useState(false);
  const [search, setSearch] = useState("");
  const [anoSemestreOptions, setAnoSemestreOptions] = useState([]);
  const [selectedSemestre, setSelectedSemestre] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchAnoSemestre = async () => {
      setLoadingSemestres(true);
      try {
        const response = await api.get('/alunos/buscarAnoSemestres');
        const options = response.data ?? [];
        setAnoSemestreOptions(options);
        if (options.length > 0) {
          setSelectedSemestre(options[0]);
        }
      } catch (error) {
        console.error('Erro ao carregar anos/semestres', error);
        toast.error('Não foi possível carregar os anos/semestres disponíveis.');
      } finally {
        setLoadingSemestres(false);
      }
    };

    fetchAnoSemestre();
  }, []);

  useEffect(() => {
    if (!selectedSemestre) return;

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await api.get('/alunos/buscarPorAnoSemestre', {
          params: { anoSemestre: selectedSemestre, page, size: PAGE_SIZE }
        });
        const responseData = response.data ?? {};
        const content = Array.isArray(responseData.content) ? responseData.content : [];
        setStudents(content);
        setTotalPages(responseData.totalPages ?? 1);
        setTotalElements(responseData.totalElements ?? 0);
      } catch (error) {
        console.error('Erro ao carregar alunos', error);
        toast.error('Não foi possível carregar a lista de alunos.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedSemestre, page]);

  const handleSemestreChange = (event) => {
    setSelectedSemestre(event.target.value);
    setPage(0);
    setSearch("");
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
    } catch {
      // logo opcional
    }

    const margin = 40;
    const imageWidth = orientation === 'landscape' ? 60 : 50;
    const imageHeight = orientation === 'landscape' ? 70 : 60;
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
    ], textX, textY + 16);

    return margin + imageHeight + 25;
  };

  const formatDate = (value) => {
    if (!value) return '-';
    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) return `${match[3]}/${match[2]}/${match[1]}`;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };

  const generateStudentPdf = async (student) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const startY = await addPdfHeader(doc, 'portrait');
    const rows = [
      ['Nome', student.nome ?? student.nomeUsuario ?? '-'],
      ['RA', student.ra ?? '-'],
      ['CPF', student.cpf ?? '-'],
      ['RG', student.rg ?? '-'],
      ['Sexo', student.sexo ?? '-'],
      ['Curso', student.descricaoCurso ?? student.curso ?? '-'],
      ['Fase', student.fase ?? '-'],
      ['Turno', student.turno ?? '-'],
      ['Ano/Semestre', student.anoSemestre ?? '-'],
      ['Email', student.email ?? '-'],
      ['Telefone', student.telefone ?? '-'],
      ['Celular', student.celular ?? '-'],
      ['Endereço', student.endereco ?? '-'],
      ['Número', student.numero ?? '-'],
      ['Bairro', student.bairro ?? '-'],
      ['Complemento', student.complemento ?? '-'],
      ['CEP', student.cep ?? '-'],
      ['Data Nascimento', formatDate(student.dataNascimento)],
      ['Raça/Etnia', student.racaEtnia?.descricaoRaca ?? '-'],
      ['Deficiência', student.deficiencia?.descricaoDefic ?? '-'],
      ['Estado Civil', student.estCivilAl?.descricaoEstCivil ?? '-']
    ];

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margin * 2;
    const col1Width = 160;
    const col2Width = tableWidth - col1Width;
    const rowHeight = 22;
    let y = startY;

    doc.setFontSize(18);
    doc.text('Relatório do Aluno', margin, y);
    y += 30;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y, col1Width, rowHeight, 'F');
    doc.rect(margin + col1Width, y, col2Width, rowHeight, 'F');
    doc.text('Campo', margin + 8, y + 15);
    doc.text('Valor', margin + col1Width + 8, y + 15);
    y += rowHeight;

    doc.setFont('helvetica', 'normal');
    rows.forEach(([label, value]) => {
      const splitted = doc.splitTextToSize(String(value || '-'), col2Width - 10);
      const blockHeight = Math.max(rowHeight, splitted.length * 14 + 8);
      if (y + blockHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.rect(margin, y, col1Width, blockHeight);
      doc.rect(margin + col1Width, y, col2Width, blockHeight);
      doc.text(String(label), margin + 8, y + 15);
      doc.text(splitted, margin + col1Width + 8, y + 15);
      y += blockHeight;
    });

    doc.save(`Relatorio_Aluno_${student.ra ?? student.nome ?? 'aluno'}.pdf`);
  };

  const exportStudentsPdf = async () => {
    if (!filteredStudents.length) {
      toast.info('Nenhum aluno encontrado para exportar.');
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 40;
    const columns = ['Nome', 'Matrícula', 'CPF', 'Curso', 'Turno', 'Ano/Semestre'];
    const colWidths = [150, 100, 80, 170, 60, 80];
    const rowHeight = 20;
    const startY = await addPdfHeader(doc, 'landscape');
    let y = startY;

    doc.setFontSize(18);
    doc.text(`Lista de Alunos — ${selectedSemestre}`, margin, y);
    y += 30;

    const drawHeader = () => {
      let x = margin;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      columns.forEach((col, i) => {
        doc.setFillColor(220, 220, 220);
        doc.rect(x, y, colWidths[i], rowHeight, 'FD');
        doc.text(col, x + 4, y + 14);
        x += colWidths[i];
      });
    };

    drawHeader();
    y += rowHeight;
    doc.setFont('helvetica', 'normal');

    filteredStudents.forEach((student) => {
      if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
        drawHeader();
        y += rowHeight;
        doc.setFont('helvetica', 'normal');
      }

      let x = margin;
      const values = [
        student.nome ?? '-',
        student.ra ?? student.matricula ?? '-',
        student.cpf ?? '-',
        student.descricaoCurso ?? student.curso ?? '-',
        student.turno ?? '-',
        student.anoSemestre ?? '-'
      ];

      values.forEach((value, i) => {
        doc.rect(x, y, colWidths[i], rowHeight);
        doc.text(doc.splitTextToSize(String(value), colWidths[i] - 8), x + 4, y + 14);
        x += colWidths[i];
      });

      y += rowHeight;
    });

    doc.save(`Lista_Alunos_${selectedSemestre}.pdf`);
  };

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.nome, student.nomeUsuario, student.matricula, student.cpf, student.ra, student.descricaoCurso, student.curso, student.turno]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [search, students]);

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-panel">
        <div className="admin-list-header">
          <div>
            <p className="admin-dashboard-kicker admin-dashboard-kicker-dark mb-2">Administrador</p>
            <h1 className="admin-dashboard-panel-title admin-list-title">Alunos</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="admin-list-pill">
              {loading ? 'Carregando...' : `${filteredStudents.length} aluno(s) encontrado(s)`}
            </div>
            <OverlayTrigger placement="top" overlay={<Tooltip>Exportar lista filtrada para PDF</Tooltip>}>
              <button type="button" className="btn btn-sm btn-primary" onClick={exportStudentsPdf}>
                Exportar lista em PDF
              </button>
            </OverlayTrigger>
          </div>
        </div>

        <div className="admin-filter-grid mt-3">
          <div className="admin-filter-field">
            <label htmlFor="select-semestre">Semestre</label>
            <select
              id="select-semestre"
              className="form-select"
              value={selectedSemestre}
              onChange={handleSemestreChange}
              disabled={loadingSemestres}
            >
              {loadingSemestres && <option value="">Carregando...</option>}
              {anoSemestreOptions.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="admin-filter-field">
            <label htmlFor="search-students">Buscar alunos</label>
            <div className="input-group">
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <OverlayTrigger placement="top" overlay={<Tooltip>Pesquise por nome, matrícula, CPF, curso ou turno</Tooltip>}>
                <input
                  id="search-students"
                  type="text"
                  className="form-control"
                  placeholder="Nome, matrícula, CPF, curso ou turno"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </OverlayTrigger>
            </div>
          </div>
        </div>

        <div className="table-responsive mt-4">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Matrícula</th>
                <th>CPF</th>
                <th>Curso</th>
                <th>Turno</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Carregando alunos...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">Nenhum aluno encontrado.</td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.idAluno ?? student.matricula ?? student.cpf}>
                    <td>{student.nome ?? '-'}</td>
                    <td>{student.ra ?? '-'}</td>
                    <td>{student.cpf ?? '-'}</td>
                    <td>{student.descricaoCurso ?? student.curso ?? '-'}</td>
                    <td>{student.turno ?? '-'}</td>
                    <td>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Gerar relatório PDF</Tooltip>}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => generateStudentPdf(student)}
                        >
                          <InfoCircle size={16} />
                        </button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 d-flex justify-content-between align-items-center">
          <div>
            {loading ? 'Carregando resultados...' : `${totalElements} aluno(s) no total`}
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
