import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './Home.css';
import Orientacoes from './Orientacoes/Orientacoes';
import { IMaskInput } from 'react-imask';
import Select from 'react-select';
import dados from '../../assets/json/estados-cidades.json';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { Floppy, XCircle } from 'react-bootstrap-icons';

const estados = dados.estados.map(e => ({
    value: e.sigla,
    label: e.nome
}));

export default function Home(){
    const [cidades, setCidades] = useState({});
    const [estadoSelecionado, setEstadosSelecionado] = useState(null);

    const handleEstadoChange = async(estado)=>{
        setEstadosSelecionado(estado);
        try {
            const estadoEsncontrado = dados.estados.find(
                e => e.sigla === estado.value
            );

            const cidadesFormatadas = estadoEsncontrado.cidades.map(cidade=>({
                value: cidade,
                label: cidade
            }));

            setCidades(cidadesFormatadas);
            
        } catch (error) {
            toast.error('Erro ao carregar as cidades');
        }
    }

    return(
        <div className="col-12 py-2">
            <div className='shadown-topo'>
                <div className="d-flex align-items-center ">
                    <h4 className='px-1'>Aluno:</h4><span className="mx-2 text-top"><strong>Teste</strong></span>
                </div>
                <div className='d-flex align-items-center'>
                    <h4 className='px-1'>RA:</h4><span className='mx-2 text-top'><strong>11112233</strong></span>
                </div>
            </div>

            <Orientacoes />

            <div className='form'>
                <form>
                    <div className='row'>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='nomeCompleto'>Nome Completo:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o nome</Tooltip>}>
                                <input id='nome' name='nome' className='form-control' disabled
                                value="Teste"/>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='RA'>RA:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o RA</Tooltip>}>
                                <input id='ra' name='ra' className='form-control' disabled value="112121"/>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-8 col-12">
                            <label htmlFor='curso'>Curso:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o curso</Tooltip>}>
                                <input id="curso" name="curso" className='form-control' disabled value="Arquitetura" />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-2 col-6'>
                            <label htmlFor='turno'>Turno:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o turno</Tooltip>}>
                                <input id="turno" name="turno" className='form-control' disabled value="N" />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-2 col-6'>
                            <label htmlFor='Fase'>Fase:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a fase</Tooltip>}>
                                <input id="fase" name="fase" className='form-control' disabled value="6" />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='ultMatricula'>Últ. Matrícula:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a última matrícula</Tooltip>}>
                                <input id="ultMatricula" name="ultMatricula" className='form-control' disabled value="UT - 2026/1" />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='cpf'>CPF:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o CPF</Tooltip>}>
                                <>
                                    <IMaskInput id="cpf" name="cpf" mask={'000.000.000-00'} disabled value="11111111111" 
                                    className='form-control'/>                               
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-4 col-12'>
                            <label htmlFor='RG'>RG:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o RG, se houver.</Tooltip>}>
                                <input id='rg' name='rg' disabled value="43547002" 
                                    className='form-control'/>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-3 col-12'>
                            <label htmlFor='dataNascimento'>Data de Nascimento:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a Data de nascimento</Tooltip>}>
                                <input id="dataNascimento" name="dataNascimento" disabled value="13/03/1986" 
                                    className='form-control' />
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-3 col-12'>
                            <label htmlFor='Raca/Etnia'>Raça/etnia</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere a raça/etnia</Tooltip>}>
                                <input id="racaetnia" name="racaetnia" disabled value="Não declarada"
                                    className='form-control'/>
                            </OverlayTrigger>
                        </div>
                        <div className='col-md-6 col-12'>
                            <label htmlFor='email'>E-mail:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Confere o e-mail</Tooltip>}>
                                <input type="email" id="email" name='email' required value="everson@everson.br"
                                    className='form-control' />
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className="row">
                        <div className='col-md-6 col-12'>
                            <label htmlFor='cep'>CEP:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o CEP </Tooltip>}>
                                <>
                                    <IMaskInput mask={'00.000-000'} id="cep" name='cep' required value="12423460"
                                        className='form-control' />
                                </>
                            </OverlayTrigger>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6 col-12">
                            <label htmlFor='endereco'>Endereço:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite a Rua</Tooltip>}>
                                <input type="text" id="endereco" name="endereco" required value="João Gandara"
                                    className='form-control'/>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-1 col-12">
                            <label htmlFor="numero">Número:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite número</Tooltip>}>
                                <input type="number" className="form-control" id="numero" name="numero" 
                                    required value="124" />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-3 col-12">
                            <label htmlFor="bairro">Bairro:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o Bairro</Tooltip>}>
                                <input type="text" className="form-control" id="bairro" name="bairro"
                                    required value="Araretama"
                                />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-2 col-12">
                            <label htmlFor="bairro">Complemento:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o Complemento</Tooltip>}>
                                <input type="text" className="form-control" id="complemento" name="complemento"
                                    required value="Casa"
                                />
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="estado">Estado</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>escolhe o estado:</Tooltip>}>
                                <>
                                    <Select
                                        placeholder="Selecione o estado"
                                        options={estados}
                                        onChange={handleEstadoChange}
                                        />
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="Cidade">Cidade:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe a cidade:</Tooltip>}>
                                <>
                                    <Select
                                        placeholder="Selecione a cidade"
                                        options={cidades}
                                        isDisabled={!estadoSelecionado}
                                    />
                                </>
                            </OverlayTrigger>
                        </div>

                        <div className="col-md-5 col-12">
                            <label htmlFor="estadoCivil">Estado Civil</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe o estado civil</Tooltip>}>
                                <>
                                    <Select 
                                        placeholder="Selecione o estado civil"
                                    />
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-2 col-12">
                            <label htmlFor="sexo">Sexo</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolha o sexo</Tooltip>}>
                                <Form.Select name="sexo" id="sexo" aria-label="Default select example" required>
                                    <option>Selecione o sexo</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Feminino</option>
                                </Form.Select>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-5 col-12">
                            <label htmlFor="possuiDeficiencia">Possui alguma deficiência:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Escolhe a deficiência</Tooltip>}>
                                <>
                                    <Select 
                                        placeholder="Por favor, escolhe um tipo de deficiência"

                                    />
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="telefone">Telefone:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite o telefone</Tooltip>}>
                                <>
                                    <IMaskInput  mask={['(00) 0000-0000', '(00) 00000-0000']}
                                        id="telefone" name="telefone" className='form-control'
                                        placeholder='Digite o telefone' />
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className="col-md-6 col-12">
                            <label htmlFor="Celular">Celular:</label>
                            <OverlayTrigger placement='top'  overlay={<Tooltip>Digite o celuar</Tooltip>}>
                                <>
                                    <IMaskInput  mask={['(00) 0000-0000', '(00) 00000-0000']}
                                        id="celular" name="celular" className='form-control'
                                        placeholder='Digite o celular' />
                                </>
                            </OverlayTrigger>
                        </div>
                        <div className="col-8">
                            <label htmlFor="disponibilidade">Disponibilidade:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Marque a disponibilidade</Tooltip>}>
                                <div className='form-control'>
                                    <input type='checkbox' className='form-check-input me-2'/>
                                    <label htmlFor="form-check-label mx-2">Manhã</label>

                                    <input type='checkbox' className='form-check-input mx-2' />                                    
                                    <label htmlFor='form-check-label'>Tarde</label>
                                    
                                    <input type='checkbox' className='form-check-input mx-2' />
                                    <label htmlFor='form-check-label'>Noite</label>
                                </div>
                            </OverlayTrigger>
                        </div>
                        <div className='col-12'>
                            <label htmlFor="curso">Curso extracurriculares:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite os cursos extracurriculares</Tooltip>}>
                                <textarea 
                                    name="cursoExtracurriculares"
                                    className='form-control'
                                    placeholder='Digite os cursos extracurriculares'
                                />
                            </OverlayTrigger>
                        </div>
                        <div className='col-12'>
                            <label htmlFor="experiencia">Experiência:</label>
                            <OverlayTrigger placement='top' overlay={<Tooltip>Digite as experiências profissionais</Tooltip>}>
                                <textarea
                                    name="experiencia"
                                    className='form-control'
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
                                <button type="submit" className='btn btn-custom mx-1'>
                                    <Floppy className="mx-1" />
                                    Salvar
                                </button>
                            </OverlayTrigger>

                            <OverlayTrigger placement='top' overlay={<Tooltip>Clique para cancelar e retornar para a página de login</Tooltip>}>
                                <button className='btn btn-outline-danger mx-1' type="button">
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