import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Home.css';
import Orientacoes from './Orientacoes/Orientacoes';
import { IMaskInput } from 'react-imask';
import Select from 'react-select';
import dados from '../../assets/json/estados-cidades.json';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { Floppy, XCircle } from 'react-bootstrap-icons';
import { ACCESS_TYPES, LOGIN_ROUTES, clearAccessSession, getStoredAlunoData } from '../../config/auth';
import { api, setAuthToken } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const estados = dados.estados.map(e => ({
    value: e.sigla,
    label: e.nome
}));

const habilidadeAtendimentoOptions = [
    { value: 1, label: 'Sim' },
    { value: 0, label: 'Não' }
];

const getResponseArray = (responseData) => {
    if (Array.isArray(responseData)) {
        return responseData;
    }

    if (Array.isArray(responseData?.data)) {
        return responseData.data;
    }

    if (Array.isArray(responseData?.content)) {
        return responseData.content;
    }

    return [];
};

const mapRacaEtniaOptions = (responseData) => getResponseArray(responseData).map((item) => ({
    value: item.idRaca,
    label: item.descricaoRaca
})).filter((item) => item.value != null && item.label);

const mapEstadoCivilOptions = (responseData) => getResponseArray(responseData).map((item) => ({
    value: item.idEstCivilAl ?? item.idEstCivil ?? item.idEstadoCivil ?? item.idEstadoCivilAl ?? item.id,
    label: item.descricao ?? item.nome ?? item.estadoCivil ?? item.descricaoEstCivil ?? item.descricaoEstadoCivil ?? item.estCivil
})).filter((item) => item.value != null && item.label);

const mapDeficienciaOptions = (responseData) => getResponseArray(responseData).map((item) => ({
    value: item.idDeficiencia ?? item.idDefic ?? item.id,
    label: item.descricaoDeficiencia ?? item.descricaoDefic ?? item.descricao ?? item.nome
})).filter((item) => item.value != null && item.label);

const buildConfirmationRows = (items) => items.filter((item) => item.value).map((item) => (
    `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;">${item.label}</td><td style="padding:6px 0;">${item.value}</td></tr>`
)).join('');

const normalizeNumericValue = (value) => {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? null : numericValue;
};

const getOptionByValue = (options, value) => options.find((option) => option.value === value) ?? null;
const getOptionByLabel = (options, label) => options.find((option) => option.label === label) ?? null;

const getCidadesByEstado = (estadoSigla) => {
    const estadoEncontrado = dados.estados.find((item) => item.sigla === estadoSigla);

    if (!estadoEncontrado) {
        return [];
    }

    return estadoEncontrado.cidades.map((cidade) => ({
        value: cidade,
        label: cidade
    }));
};

export default function Home(){
    const navigate = useNavigate();
    const aluno = getStoredAlunoData();
    const hasAlunoRacaEtnia = Boolean(aluno?.racaEtnia?.trim());

    const [racaEtniaOptions, setRacaEtniaOptions] = useState([]);
    const [estadoCivilOptions, setEstadoCivilOptions] = useState([]);
    const [deficienciaOptions, setDeficienciaOptions] = useState([]);
    const [cidades, setCidades] = useState([]);
    const [estadoSelecionado, setEstadosSelecionado] = useState(null);
    const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
    const [estadoCivilSelecionado, setEstadoCivilSelecionado] = useState(null);
    const [deficienciaSelecionada, setDeficienciaSelecionada] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCep, setIsLoadingCep] = useState(false);
    const [formData, setFormData] = useState({
        email: aluno?.email ?? '',
        cep: '',
        endereco: '',
        numero: '',
        bairro: '',
        complemento: '',
        idEstCivilAl: null,
        sexo: '',
        idDeficiencia: null,
        telefone: aluno?.telefoneRes ?? '',
        celular: aluno?.celular ?? '',
        cursoExtracurricular: '',
        experienciaCurricular: '',
        disponibilidadeManha: 0,
        disponibilidadeTarde: 0,
        disponibilidadeNoite: 0,
        habilidadeAtendPublico: 0,
        idRacaEtnia: null
    });

    useEffect(() => {
        const loadFormOptions = async () => {
            try {
                const [racaResponse, estadoCivilResponse, deficienciaResponse] = await Promise.all([
                    api.get('/raca-etnia/ativos'),
                    api.get('/estadoCivil/ativos'),
                    api.get('/deficiencias/ativas')
                ]);

                const nextRacaEtniaOptions = mapRacaEtniaOptions(racaResponse.data);
                const nextEstadoCivilOptions = mapEstadoCivilOptions(estadoCivilResponse.data);
                const nextDeficienciaOptions = mapDeficienciaOptions(deficienciaResponse.data);

                setRacaEtniaOptions(nextRacaEtniaOptions);
                setEstadoCivilOptions(nextEstadoCivilOptions);
                setDeficienciaOptions(nextDeficienciaOptions);

                if (aluno?.racaEtnia) {
                    const selectedOption = getOptionByLabel(nextRacaEtniaOptions, aluno.racaEtnia);

                    if (selectedOption) {
                        setFormData((currentData) => ({
                            ...currentData,
                            idRacaEtnia: selectedOption.value
                        }));
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar dados iniciais do formulário', error);
                setRacaEtniaOptions([]);
                setEstadoCivilOptions([]);
                setDeficienciaOptions([]);
                toast.error('Não foi possível carregar os dados do formulário.');
            }
        };

        loadFormOptions();
    }, [aluno?.racaEtnia]);

    const formatDate = (value) => {
        if (!value) {
            return '';
        }

        return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
    };

    const formatCpf = (value) => {
        const digits = value?.replace(/\D/g, '');

        if (!digits) {
            return '';
        }

        return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    };

    const handleInputChange = ({ target }) => {
        const { name, value } = target;
        setFormData((currentData) => ({
            ...currentData,
            [name]: value
        }));
    };

    const handleMaskedChange = (fieldName) => (value) => {
        setFormData((currentData) => ({
            ...currentData,
            [fieldName]: value
        }));
    };

    const handleCidadeChange = (selectedOption) => {
        setCidadeSelecionada(selectedOption);
    };

    const handleCheckboxChange = (fieldName) => ({ target }) => {
        setFormData((currentData) => ({
            ...currentData,
            [fieldName]: target.checked ? 1 : 0
        }));
    };

    const handleSelectChange = (fieldName, setSelectedOption) => (selectedOption) => {
        if (setSelectedOption) {
            setSelectedOption(selectedOption);
        }

        setFormData((currentData) => ({
            ...currentData,
            [fieldName]: normalizeNumericValue(selectedOption?.value)
        }));
    };

    const handleEstadoChange = async(estado)=>{
        setEstadosSelecionado(estado);
        setCidadeSelecionada(null);

        try {
            const cidadesFormatadas = getCidadesByEstado(estado?.value);

            if (cidadesFormatadas.length === 0) {
                setCidades([]);
                return;
            }

            setCidades(cidadesFormatadas);
        } catch (error) {
            toast.error('Erro ao carregar as cidades');
        }
    };

    const handleCepChange = async (value) => {
        handleMaskedChange('cep')(value);

        const cepDigits = value.replace(/\D/g, '');

        if (cepDigits.length !== 8) {
            return;
        }

        setIsLoadingCep(true);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`);
            const data = await response.json();

            if (!response.ok || data.erro) {
                toast.error('Não foi possível localizar o CEP informado.');
                return;
            }

            const estadoOption = getOptionByValue(estados, data.uf) ?? getOptionByLabel(estados, data.uf);
            const nextCidades = getCidadesByEstado(data.uf);
            const cidadeOption = nextCidades.find((cidade) => cidade.label.toLowerCase() === data.localidade?.toLowerCase()) ?? null;

            setFormData((currentData) => ({
                ...currentData,
                endereco: data.logradouro ?? currentData.endereco,
                bairro: data.bairro ?? currentData.bairro,
                complemento: data.complemento || currentData.complemento
            }));
            setEstadosSelecionado(estadoOption);
            setCidades(nextCidades);
            setCidadeSelecionada(cidadeOption);
        } catch (error) {
            console.error('Erro ao buscar CEP', error);
            toast.error('Não foi possível carregar os dados do CEP.');
        } finally {
            setIsLoadingCep(false);
        }
    };

    const handleCancel = () => {
        navigate('/', { replace: true });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!aluno) {
            toast.error('Dados do aluno não encontrados. Faça a identificação novamente.');
            return;
        }

        const payload = {
            aluno:{
                ra: aluno.ra,
                nome: aluno.nome,
                cpf: aluno.cpf,
                rg: aluno.rg,
                sexo: formData.sexo,
                idRacaEtnia: normalizeNumericValue(formData.idRacaEtnia),
                idDeficiencia: normalizeNumericValue(formData.idDeficiencia),
                idEstCivilAl: normalizeNumericValue(formData.idEstCivilAl),
                dataNascimento: aluno.dataNascimento,
                email: formData.email,
                telefone: formData.telefone,
                celular: formData.celular,
                cep: formData.cep,
                endereco: formData.endereco,
                numero: formData.numero,
                bairro: formData.bairro,
                complemento: formData.complemento,
                codigoCurso: aluno.codigoCurso,
                descricaoCurso: aluno.curso,
                fase: aluno.fase,
                turno: aluno.turno
            },
            alunoSemestre :{
                anoSemestre: aluno.periodoLetivo,
                disponibilidadeManha: formData.disponibilidadeManha,
                disponibilidadeTarde: formData.disponibilidadeTarde,
                disponibilidadeNoite: formData.disponibilidadeNoite,
                habilidadeAtendPublico: formData.habilidadeAtendPublico,
                cursoExtracurricular: formData.cursoExtracurricular,
                experienciaCurricular: formData.experienciaCurricular
            }
        };


        const confirmationRows = buildConfirmationRows([
            { label: 'Nome', value: payload.aluno.nome },
            { label: 'RA', value: payload.aluno.ra },
            { label: 'CPF', value: formatCpf(payload.aluno.cpf) },
            { label: 'E-mail', value: payload.aluno.email },
            { label: 'Telefone', value: payload.aluno.telefone },
            { label: 'Celular', value: payload.aluno.celular },
            { label: 'CEP', value: payload.aluno.cep },
            { label: 'Endereço', value: payload.aluno.endereco },
            { label: 'Número', value: payload.aluno.numero },
            { label: 'Bairro', value: payload.aluno.bairro },
            { label: 'Complemento', value: payload.aluno.complemento },
            { label: 'Estado Civil', value: getOptionByValue(estadoCivilOptions, payload.aluno.idEstCivilAl)?.label },
            { label: 'Sexo', value: payload.aluno.sexo },
            { label: 'Deficiência', value: getOptionByValue(deficienciaOptions, payload.aluno.idDeficiencia)?.label },
            { label: 'Raça/Etnia', value: getOptionByValue(racaEtniaOptions, payload.aluno.idRacaEtnia)?.label },
            { label: 'Disponibilidade', value: [
                payload.alunoSemestre.disponibilidadeManha ? 'Manhã' : null,
                payload.alunoSemestre.disponibilidadeTarde ? 'Tarde' : null,
                payload.alunoSemestre.disponibilidadeNoite ? 'Noite' : null
            ].filter(Boolean).join(', ') },
            { label: 'Atendimento ao público', value: getOptionByValue(habilidadeAtendimentoOptions, payload.alunoSemestre.habilidadeAtendPublico)?.label }
        ]);

        const confirmation = await Swal.fire({
            title: 'Por favor confirme os dados',
            html: `
                <p style="margin-bottom:12px;">Quer que grave estes dados ou quer corrigi-los?</p>
                <div style="max-height:320px;overflow:auto;text-align:left;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tbody>${confirmationRows}</tbody>
                    </table>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Gravar',
            cancelButtonText: 'Corrigir',
            reverseButtons: true,
            focusCancel: true
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {

            console.log(payload);
            const data = await api.post('/cadastroCompleto', payload);

            toast.success('Cadastro do aluno enviado com sucesso.');
            clearAccessSession(ACCESS_TYPES.aluno);
            navigate(LOGIN_ROUTES.aluno, { replace: true });
            // setAuthToken(null);
        } catch (error) {
            console.error('Erro ao cadastrar aluno', error);
            toast.error(error?.response?.data?.message ?? 'Não foi possível salvar os dados do aluno.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return(
        <div className="col-12 py-2">
            <div className='shadown-topo'>
                <div className="d-flex align-items-center ">
                    <h4 className='px-1'>Aluno:</h4><span className="mx-2 text-top"><strong>{aluno?.nome ?? '-'}</strong></span>
                </div>
                <div className='d-flex align-items-center'>
                    <h4 className='px-1'>RA:</h4><span className='mx-2 text-top'><strong>{aluno?.ra ?? '-'}</strong></span>
                </div>
            </div>

            <Orientacoes />

            <div className='form'>
                <form onSubmit={handleSubmit}>
                    <div className='row'>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='nomeCompleto'>Nome Completo:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o nome</Tooltip>}>
                                <input id='nome' name='nome' className='form-control' disabled
                                value={aluno?.nome ?? ''}/>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='RA'>RA:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o RA</Tooltip>}>
                                <input id='ra' name='ra' className='form-control' disabled value={aluno?.ra ?? ''}/>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-8 col-12">
                            <label htmlFor='curso'>Curso:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o curso</Tooltip>}>
                                <input id="curso" name="curso" className='form-control' disabled value={aluno?.curso ?? ''} />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-2 col-6'>
                            <label htmlFor='turno'>Turno:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o turno</Tooltip>}>
                                <input id="turno" name="turno" className='form-control' disabled value={aluno?.turno ?? ''} />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-2 col-6'>
                            <label htmlFor='Fase'>Fase:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a fase</Tooltip>}>
                                <input id="fase" name="fase" className='form-control' disabled value={aluno?.fase ?? ''} />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='ultMatricula'>Últ. Matrícula:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a última matrícula</Tooltip>}>
                                <input id="ultMatricula" name="ultMatricula" className='form-control' disabled value={aluno?.periodoLetivo ?? ''} />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='cpf'>CPF:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o CPF</Tooltip>}>
                                <div>
                                    <IMaskInput id="cpf" name="cpf" mask={'000.000.000-00'} disabled value={formatCpf(aluno?.cpf)} 
                                    className='form-control'/>                               
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='RG'>RG:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o RG, se houver.</Tooltip>}>
                                <input id='rg' name='rg' disabled value={aluno?.rg ?? ''} 
                                    className='form-control'/>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-3 col-12'>
                            <label htmlFor='dataNascimento'>Data de Nascimento:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a Data de nascimento</Tooltip>}>
                                <input id="dataNascimento" name="dataNascimento" disabled value={formatDate(aluno?.dataNascimento)} 
                                    className='form-control' />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-3 col-12'>
                            <label htmlFor='Raca/Etnia'>Raça/etnia</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a raça/etnia</Tooltip>}>
                                {hasAlunoRacaEtnia ? (
                                    <input id="racaetnia" name="racaetnia" disabled value={aluno?.racaEtnia ?? ''}
                                        className='form-control'/>
                                ) : (
                                    <div>
                                        <Select
                                            inputId="racaetnia"
                                            placeholder="Selecione a raça/etnia"
                                            options={racaEtniaOptions}
                                            value={getOptionByValue(racaEtniaOptions, formData.idRacaEtnia)}
                                            onChange={handleSelectChange('idRacaEtnia')}
                                        />
                                    </div>
                                )}
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='email'>E-mail:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o e-mail</Tooltip>}>
                                <input type="email" id="email" name='email' required value={formData.email}
                                    onChange={handleInputChange}
                                    className='form-control' />
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className="row">
                        <div className='col-md-6 col-12'>
                            <label htmlFor='cep'>CEP:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o CEP </Tooltip>}>
                                <div>
                                    <IMaskInput mask={'00.000-000'} id="cep" name='cep' required value={formData.cep}
                                        onAccept={handleCepChange}
                                        className='form-control' />
                                </div>
                            </OverlayTrigger>
                            {isLoadingCep ? <small className="text-muted">Buscando CEP...</small> : null}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <label htmlFor='endereco'>Endereço:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite a Rua</Tooltip>}>
                                <input type="text" id="endereco" name="endereco" required value={formData.endereco}
                                    onChange={handleInputChange}
                                    className='form-control'/>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-1 col-12">
                            <label htmlFor="numero">Número:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite número</Tooltip>}>
                                <input type="number" className="form-control" id="numero" name="numero" 
                                    required value={formData.numero} onChange={handleInputChange} />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-3 col-12">
                            <label htmlFor="bairro">Bairro:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o Bairro</Tooltip>}>
                                <input type="text" className="form-control" id="bairro" name="bairro"
                                    required value={formData.bairro} onChange={handleInputChange}
                                />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-2 col-12">
                            <label htmlFor="bairro">Complemento:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o Complemento</Tooltip>}>
                                <input type="text" className="form-control" id="complemento" name="complemento"
                                    required value={formData.complemento} onChange={handleInputChange}
                                />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="estado">Estado</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>escolhe o estado:</Tooltip>}>
                                <div>
                                    <Select
                                        placeholder="Selecione o estado"
                                        options={estados}
                                        value={estadoSelecionado}
                                        onChange={handleEstadoChange}
                                        />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="Cidade">Cidade:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe a cidade:</Tooltip>}>
                                <div>
                                    <Select
                                        placeholder="Selecione a cidade"
                                        options={cidades}
                                        value={cidadeSelecionada}
                                        onChange={handleCidadeChange}
                                        isDisabled={!estadoSelecionado}
                                    />
                                </div>
                            </OverlayTrigger>
                        </div>

                        <div className="col-md-5 col-12">
                            <label htmlFor="estadoCivil">Estado Civil</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe o estado civil</Tooltip>}>
                                <div>
                                    <Select 
                                        placeholder="Selecione o estado civil"
                                        options={estadoCivilOptions}
                                        value={estadoCivilSelecionado}
                                        onChange={handleSelectChange('idEstCivilAl', setEstadoCivilSelecionado)}
                                    />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-2 col-12">
                            <label htmlFor="sexo">Sexo</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolha o sexo</Tooltip>}>
                                <Form.Select name="sexo" id="sexo" aria-label="Default select example" required value={formData.sexo} onChange={handleInputChange}>
                                    <option value="">Selecione o sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </Form.Select>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-5 col-12">
                            <label htmlFor="possuiDeficiencia">Possui alguma deficiência:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe a deficiência</Tooltip>}>
                                <div>
                                    <Select 
                                        placeholder="Por favor, escolhe um tipo de deficiência"
                                        options={deficienciaOptions}
                                        value={deficienciaSelecionada}
                                        onChange={handleSelectChange('idDeficiencia', setDeficienciaSelecionada)}
                                    />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="habilidadeAtendPublico">Habilidade para atendimento ao público:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Informe se possui habilidade para atendimento ao público</Tooltip>}>
                                <div>
                                    <Select
                                        placeholder="Selecione uma opção"
                                        options={habilidadeAtendimentoOptions}
                                        value={getOptionByValue(habilidadeAtendimentoOptions, formData.habilidadeAtendPublico)}
                                        onChange={handleSelectChange('habilidadeAtendPublico')}
                                    />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="telefone">Telefone:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o telefone</Tooltip>}>
                                <div>
                                    <IMaskInput  mask={['(00) 0000-0000', '(00) 00000-0000']}
                                        id="telefone" name="telefone" className='form-control'
                                        placeholder='Digite o telefone' value={formData.telefone}
                                        onAccept={handleMaskedChange('telefone')} />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="Celular">Celular:</label>
                            <OverlayTrigger placement='top'  overlay={<Tooltip>Digite o celuar</Tooltip>}>
                                <div>
                                    <IMaskInput  mask={['(00) 0000-0000', '(00) 00000-0000']}
                                        id="celular" name="celular" className='form-control'
                                        placeholder='Digite o celular' value={formData.celular}
                                        onAccept={handleMaskedChange('celular')} />
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className="col-8">
                            <label htmlFor="disponibilidade">Disponibilidade:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Marque a disponibilidade</Tooltip>}>
                                <div className='form-control'>
                                    <input type='checkbox' className='form-check-input me-2' checked={formData.disponibilidadeManha === 1} onChange={handleCheckboxChange('disponibilidadeManha')}/>
                                    <label htmlFor="form-check-label mx-2">Manhã</label>

                                    <input type='checkbox' className='form-check-input mx-2' checked={formData.disponibilidadeTarde === 1} onChange={handleCheckboxChange('disponibilidadeTarde')} />                                    
                                    <label htmlFor='form-check-label'>Tarde</label>
                                    
                                    <input type='checkbox' className='form-check-input mx-2' checked={formData.disponibilidadeNoite === 1} onChange={handleCheckboxChange('disponibilidadeNoite')} />
                                    <label htmlFor='form-check-label'>Noite</label>
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className='col-12'>
                            <label htmlFor="curso">Curso extracurriculares:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite os cursos extracurriculares</Tooltip>}>
                                <textarea 
                                    name="cursoExtracurricular"
                                    className='form-control'
                                    value={formData.cursoExtracurricular}
                                    onChange={handleInputChange}
                                    placeholder='Digite os cursos extracurriculares'
                                />
                            </OverlayTrigger>
                        </div>
                        <div className='col-12'>
                            <label htmlFor="experiencia">Experiência:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite as experiências profissionais</Tooltip>}>
                                <textarea
                                    name="experienciaCurricular"
                                    className='form-control'
                                    value={formData.experienciaCurricular}
                                    onChange={handleInputChange}
                                    placeholder='Digite as experiências profissionais'
                                />
                            </OverlayTrigger>
                        </div>
                        <div className='col-12 m-2 bg-light border text-bottom'>
                            <p>Ao inscrever-se para a Bolsa de Aprimoramento/Apoio à Inclusão, 
                                o(a) aluno(a) declara estar ciente e de acordo com as seguintes condições:</p>
                            <ul>
                                <li>
                                    As normas de concessão de bolsas previstas na Deliberação CONSAD nº 144/2025, 
                                    que dispõe sobre bolsas institucionais, disponível no site da UNITAU: 
                                    <a href='https://unitau.br/arquivos-downloads/consad_144_2025.pdf' target='_blank' className='mx-1'>Clique Aqui</a>
                                </li>
                                <li>
                                    As informações preenchidas no ato da inscrição são de inteira responsabilidade do(a) aluno(a) e não poderão ser alteradas 
                                    posteriormente.
                                </li>
                                <li>
                                    Caso exista débito financeiro, a Bolsa de Aprimoramento/Apoio à Inclusão somente poderá ser 
                                    concedida após a formalização de acordo financeiro junto à Pró-Reitoria de Economia e Finanças.
                                </li>
                            </ul>
                        </div>
                        <div className="col-12 my-2 d-flex justify-content-center">
                            <OverlayTrigger placement='top' overlay={<Tooltip>Clique para salvar as informações</Tooltip>}>
                                <button type="submit" className='btn btn-custom mx-1' disabled={isSubmitting}>
                                    <Floppy className="mx-1" />
                                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                                </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement='top' overlay={<Tooltip>Clique para cancelar e retornar para a página de login</Tooltip>}>
                                <button className='btn btn-outline-danger mx-1' type="button" onClick={handleCancel}>
                                    <XCircle className='mx-1'/>
                                    Cancelar
                                </button>
                            </OverlayTrigger>
                            
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}