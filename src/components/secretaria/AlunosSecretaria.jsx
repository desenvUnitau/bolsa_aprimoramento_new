import { useEffect, useMemo, useState } from "react";
import { InfoCircle, Search, SendCheckFill, SendPlus } from "react-bootstrap-icons";
import { jsPDF } from "jspdf";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import AdminPagination from "../admin/AdminPagination";
import { api } from "../../config/api";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const PAGE_SIZE = 10;

export default function AlunosSecretaria() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [anoSemestre, setAnoSemestre] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchAnoSemestre = async () => {
      try {
        const response = await api.get('/alunos/buscarAnoSemestres');
        const options = response.data ?? [];
        setAnoSemestre(options);
      } catch (error) {
        console.error('Erro ao carregar anos/semestres', error);
        toast.error('Não foi possível carregar os anos/semestres disponíveis.');
      }
    };

    fetchAnoSemestre();
  }, []);

  useEffect(() => {
    if (!anoSemestre.length) {
      return;
    }

    const fetchStudents = async () => {
      setLoading(true);

      try {
        const primeiroAnoSemestre = anoSemestre[0];
        const response = await api.get('/alunos/buscarPorAnoSemestre', {
          params: {
            anoSemestre: primeiroAnoSemestre,
            page,
            size: PAGE_SIZE
          }
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
  }, [anoSemestre, page]);

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
    if (!value) {
      return '-';
    }

    if (typeof value === 'string') {
      const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (match) {
        return `${match[3]}/${match[2]}/${match[1]}`;
      }
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear());

    return `${day}/${month}/${year}`;
  };

  const generateStudentPdf = async (student) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const title = 'Relatório do Aluno';
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
      ['Estado Civil', student.estCivilAl?.descricaoEstCivil ?? '-'],
      ['Disponibilidade de Manhã', (student.disponibilidadeManha == 0 || student.disponibilidadeManha == null) ? '-' : "sim"],
      ['Disponibilidade de tarde', (student.disponibilidadeTarde == 0 || student.disponibilidadeTarde == null) ? '-' : "sim"],
      ['Disponibilidade de Noite', (student.disponibilidadeNoite == 0 || student.disponibilidadeNoite == null) ? '-' : "sim"],
      ['Hab. de Atend. ao Público', (student.habilidadeAtendPublico == 0 || student.habilidadeAtendPublico == null) ? '-' : "sim"],
      ['Curso Extracurricular', student.cursoExtracurricular ?? '-' ],
      ['Experiência Curricular', student.experienciaCurricular ?? '-' ],
    ];

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margin * 2;
    const col1Width = 160;
    const col2Width = tableWidth - col1Width;
    const rowHeight = 22;
    let y = startY;

    doc.setFontSize(18);
    doc.text(title, margin, y);

    y += 30;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(220, 220, 220);
    doc.rect(margin, y, col1Width, rowHeight, 'F');
    doc.rect(margin + col1Width, y, col2Width, rowHeight, 'F');
    doc.setTextColor(0, 0, 0);
    doc.text('Campo', margin + 8, y + 15);
    doc.text('Valor', margin + col1Width + 8, y + 15);

    y += rowHeight;
    doc.setFont('helvetica', 'normal');

    rows.forEach(([label, value]) => {
      const wrappedValue = String(value || '-');
      const splitted = doc.splitTextToSize(wrappedValue, col2Width - 10);
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

    const fileName = `Relatorio_Aluno_${student.ra ?? student.nome ?? 'aluno'}.pdf`;
    doc.save(fileName);
  };

  const exportStudentsPdf = async () => {
    if (!filteredStudents.length) {
      toast.info('Nenhum aluno encontrado para exportar.');
      return;
    }

    const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'landscape' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const tableWidth = pageWidth - margin * 2;
    const columns = ['Nome', 'Matrícula', 'CPF', 'Curso', 'Turno', 'Ano/Semestre'];
    const colWidths = [150, 100, 80, 170, 60, 80];
    const rowHeight = 20;
    const startY = await addPdfHeader(doc, 'landscape');
    let y = startY;

    doc.setFontSize(18);
    doc.text('Lista de Alunos', margin, y);
    y += 30;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(0, 0, 0);
    doc.setTextColor(0, 0, 0);

    let x = margin;
    columns.forEach((column, index) => {
      const width = colWidths[index];
      doc.setFillColor(220, 220, 220);
      doc.rect(x, y, width, rowHeight, 'FD');
      doc.text(column, x + 4, y + 14);
      x += width;
    });

    y += rowHeight;
    doc.setFont('helvetica', 'normal');

    filteredStudents.forEach((student) => {
      if (y + rowHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
        x = margin;
        doc.setFont('helvetica', 'bold');
        doc.setDrawColor(0, 0, 0);
        doc.setTextColor(0, 0, 0);
        columns.forEach((column, index) => {
          const width = colWidths[index];
          doc.setFillColor(220, 220, 220);
          doc.rect(x, y, width, rowHeight, 'FD');
          doc.text(column, x + 4, y + 14);
          x += width;
        });
        y += rowHeight;
        doc.setFont('helvetica', 'normal');
      }

      x = margin;
      const values = [
        student.nome ?? '-',
        student.ra ?? student.matricula ?? '-',
        student.cpf ?? '-',
        student.descricaoCurso ?? student.curso ?? '-',
        student.turno ?? '-',
        student.anoSemestre ?? '-'
      ];

      values.forEach((value, index) => {
        const width = colWidths[index];
        doc.rect(x, y, width, rowHeight);
        const text = String(value);
        const fitted = doc.splitTextToSize(text, width - 8);
        doc.text(fitted, x + 4, y + 14);
        x += width;
      });

      y += rowHeight;
    });

    doc.save('Lista_Alunos.pdf');
  };

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return students;
    }

    return students.filter((student) => {
      return [
        student.nome,
        student.nomeUsuario,
        student.matricula,
        student.cpf,
        student.ra,
        student.descricaoCurso,
        student.curso,
        student.turno
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [search, students]);

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

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-panel">
        <div className="admin-list-header">
          <div>
            <p className="admin-dashboard-kicker admin-dashboard-kicker-dark mb-2">Secretaria</p>
            <h1 className="admin-dashboard-panel-title admin-list-title">Alunos</h1>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="admin-list-pill">
              {loading
                ? 'Carregando...'
                : `${filteredStudents.length} aluno(s) encontrado(s)`}
            </div>
            <OverlayTrigger placement="top" overlay={<Tooltip>Exportar a lista de alunos filtrada para PDF</Tooltip>}>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={exportStudentsPdf}
              >
                Exportar lista em PDF
              </button>            
            </OverlayTrigger>
          </div>
        </div>

        <div className="admin-filter-grid mt-3">
          <div className="admin-filter-field">
            <label htmlFor="search-students">Buscar alunos</label>
            <div className="input-group">
              <span className="input-group-text">
                <Search size={18} />
              </span>
              <OverlayTrigger placement="top" 
              overlay={<Tooltip>Pesquise por nome, matrícula, CPF, curso ou turno</Tooltip>}>
                <input
                  id="search-students"
                  type="text"
                  className="form-control"
                  placeholder="Nome, matrícula, CPF, curso ou turno"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
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
                  <td colSpan={6} className="text-center py-4">
                    Carregando alunos...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Nenhum aluno encontrado.
                  </td>
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
                      <div className="d-flex">
                        <OverlayTrigger placement="top" overlay={<Tooltip>Gerar relatório PDF</Tooltip>}>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary mx-1"
                            title="Gerar relatório PDF"
                            onClick={() => generateStudentPdf(student)}>
                            <InfoCircle size={16} />
                          </button>                        
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={<Tooltip>Solicitar aluno</Tooltip>}>
                            <button type="button" className="btn btn-sm btn-success"
                            onClick={()=> handleSolicitacaoAluno(student)}>
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
              : `${totalElements} aluno(s) no total`}
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
