import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NfseService } from '../nfse.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoginService } from '../../../login/login.service';
import { EmpresasService } from '../../../login/usuarios/empresas/empresas.service';
import { WebserviceService } from '../../webservice/webservice.service';
import { PessoasService } from '../../pessoas/pessoas.service';
import { arredondarABNT } from '../arredondamentoAbnt/arredondamento';

interface ITEMLCVinculado {
  COD_ITEM_LC: string;
  DESC_ITEM_LC: string;
}

interface CnaeVinculado {
  COD_CNAE: string;
  DESC_CNAE: string;
}

export const currencyMaskConfig = {
  align: "left",
  allowNegative: false,
  allowZero: true,
  decimal: ",",
  precision: 2,
  prefix: "R$ ",
  suffix: "",
  thousands: ".",
  nullable: false
};

interface Pessoa {
  CPF: string;
  CPF_CNPJ: string; // Adicionado
  IM: string; // Adicionado
  NOME: string;
  EMAIL?: string;
  TIPO_USER?: string;
  DDD?: string; // Adicionado
  TELEFONE_CELULAR?: string; // Adicionado
  CEP?: string;
  RUA_LOGRADOURO?: string;
  NUMERO_LOGRADOURO?: string;
  BAIRRO_LOGRADOURO?: string;
  COMPLEMENTO_LOGRADOURO?: string;
  CIDADE?: string;
  COD_IBGE?: string;
  UF?: string;
}

interface Cidade {
  COD_IBGE: string;
  NOME_CIDADE: string;
  COD_UF: string;
}

@Component({
  selector: 'app-gerar-nfse',
  templateUrl: './gerar-nfse.component.html',
  styleUrls: ['./gerar-nfse.component.css'],
  providers: [MessageService]
})
export class GerarNfseComponent implements OnInit {
  novaPessoa: any = {};
  exibirMensagem: boolean = false;
  isEnvioSucesso: boolean = false;
  mensagem: string = '';
  loading = false;
  cidades: any[] = [];
  ufs: string[] = [];
  filteredCidadesPrestacao: any[] = [];
  filteredCidadesIncidencia: any[] = [];
  selectedCidadePrestacao: Cidade | null = null;
  selectedCidadeIncidencia: Cidade | null = null;
  nomeCidadeTomador: string = '';
  novoCliente: string = ''; // Para criação de uma nova comanda
  cnpj: string | null = null; // CNPJ do prestador logado
  CNPJ: string | null = null; // CNPJ do prestador logado
  cpfCnpjInput: string = ''; // Para entrada de CPF/CNPJ
  nomeCliente: string = ''; // Para entrada do nome do cliente
  CPF_CNPJ_CLIENTE: string = '';
  enderecoCliente: string = ''; // Para entrada do endereço
  displayDialogCPF: boolean = false; // Controle do diálogo para CPF/CNPJ
  displayDialogEndereco: boolean = false; // Controle do diálogo para nome e endereço
  resultado: Pessoa | null = null; // Tipado como Pessoa
  pessoasEncontrados: Pessoa[] = []; // Lista de pessoas encontradas
  displayDialogUsuarios: boolean = false;
  displayDialogNovaPessoa: boolean = false; // Controla o diálogo de nova pessoa

  // Propriedades faltantes
  CPF_CNPJ: string = ''; // Adicionada a propriedade CPF_CNPJ
  nome: string = ''; // Adicionada a propriedade nome

  isOptanteSimplesNacional: boolean = false;
  isMunicipioSantaMaria: boolean = true; // Assume Santa Maria como padrão

  nfseData = {
    identificacao: {
      numero: '',
      serie: '',
      tipo: '1'
    },
    dataEmissao: new Date().toISOString().split('T')[0],
    status: '1',
    competencia: new Date().toISOString().split('T')[0],
    servico: {
      itemListaServico: '',
      codigoCnae: '',
      codigoTributacaoMunicipio: '',
      discriminacao: '',
      codigoMunicipio: '',
      exigibilidadeISS: '1',
      municipioIncidencia: '',
      issRetido: '2',
      responsavelRetencao: '',
      valores: {
        valorServicos: '',
        valorDeducoes: '',
        valorPis: '',
        valorCofins: '',
        valorInss: '',
        valorIr: '',
        valorCsll: '',
        outrasRetencoes: '',
        valorIss: '',
        aliquota: '',
        descontoIncondicionado: '',
        descontoCondicionado: '',
        valorLiquido: '',
        baseCalculo: ''
      }
    },
    tomador: {
      identificacao: {
        cpf: '',
        cnpj: '',
        inscricaoMunicipal: ''
      },
      razaoSocial: '',
      endereco: {
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        codigoMunicipio: '',
        uf: '',
        cep: ''
      },
      contato: {
        telefone: '',
        email: ''
      },
      nifTomador: ''
    },
    incentivoFiscal: '2',
    informacoesComplementares: '',
    optanteSimplesNacional: ''
  };
  ufSelecionadaPrestacao: string = '';
  ufSelecionadaIncidencia: string = '';
  empresaSelecionada: any = null;
  inscricaoMunicipalManual: string = '';
  serieRPS: string = '';
  filteredCidadesTomador: any[] = [];
  selectedCidadeTomador: Cidade | null = null;
  defaultUf = 'RS';
  defaultCidade = 'Santa Maria';

/////////////////////////////////////// CNAES
cnaeParaAdicionar: string = '';
mostrarAdicionarCnae: boolean = false;
cnaesDisponiveis: any[] = [];
cnaeFiltrado: any[] = [];
mostrarDialogoCnae: boolean = false;
cnaeSelecionado: any = null;
cnaesFiltrados: any[] = [];
codCnaeBusca: string = '';
descCnaeBusca: string = '';
cnaesEncontrados: any[] = [];
carregandoCnaes: boolean = false;
carregandoCnaesDaEmpresa: boolean = false;
cnaesDaEmpresa: CnaeVinculado[] = [];

//////////////////////ATIVIDADES MUNICIPAIS
mostrarAdicionarCodigoTributacao: boolean = false;
codigosTributacaoDaEmpresa: any[] = [];
carregandoCodigosTributacaoDaEmpresa: boolean = false;
codigoTributacaoParaAdicionar = {
  COD_ATIVIDADE: '',
  DESC_ATIVIDADE: ''
};

/////////////////////////ITEM LC
ITEMLCParaAdicionar: string = '';
mostrarAdicionarITEMLC: boolean = false;
ITEMLCsDisponiveis: any[] = [];
ITEMLCFiltrado: any[] = [];
mostrarDialogoITEMLC: boolean = false;
ITEMLCSelecionado: any = null;
ITEMLCsFiltrados: any[] = [];
codITEMLCBusca: string = '';
descITEMLCBusca: string = '';
ITEMLCsEncontrados: any[] = [];
carregandoITEMLCs: boolean = false;
carregandoITEMLCsDaEmpresa: boolean = false;
ITEMLCsDaEmpresa: ITEMLCVinculado[] = [];

currencyOptions = {
  prefix: 'R$ ',
  thousands: '.',
  decimal: ',',
  align: 'left',
  allowNegative: false,
  precision: 2
};

percentMaskOptions = {
  prefix: '',          // Sem prefixo tipo %
  thousands: '',       // Sem separador de milhar
  decimal: ',',        // Usa vírgula como decimal
  align: 'left',
  allowNegative: false,
  precision: 2         // 2 casas decimais
};

ISSQN_RETIDO = [
  { nome: 'SIM', codigo: '1' },
  { nome: 'NÃO', codigo: '2' }
];

RESPONSAVEL_RETENCAO = [
  { nome: 'TOMADOR', codigo: '1' },
  { nome: 'INTERMEDIÁRIO', codigo: '2' }
];


  constructor(
    private nfseService: NfseService,
    private messageService: MessageService,
    private loginService: LoginService,
    private empresaService: EmpresasService,
    private webserviceService: WebserviceService,
    private pessoasService: PessoasService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Obter o CNPJ da empresa logada
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;
    this.ufSelecionadaPrestacao = this.defaultUf;
    this.ufSelecionadaIncidencia = this.defaultUf;
    
    // Filtrar cidades para RS
    this.filtrarCidadesPrestacao(this.defaultUf);
    this.filtrarCidadesIncidencia(this.defaultUf);
    
    // Corrigido: usar this.cnpj em vez de data.CNPJ
    if (this.cnpj) {
      this.carregarCnaesDaEmpresa(this.cnpj);
      this.carregarCodigosTributacaoDaEmpresa(this.cnpj)
      this.carregarITEMLCsDaEmpresa(this.cnpj);
    }
  
    
    // Selecionar Santa Maria após carregar cidades
    this.carregarCidades();
    
    setTimeout(() => {
      const santaMaria = this.cidades.find(c => c.NOME_CIDADE === 'SANTA MARIA' && c.COD_UF === 'RS');
      if (santaMaria) {
        this.selectedCidadePrestacao = santaMaria;
        this.selectedCidadeIncidencia = santaMaria;
      }
    }, 500); 
  
    // Verificar se o CNPJ está disponível antes de tentar carregar os dados
    if (this.cnpj) {
      this.carregarDadosEmpresa();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nenhuma empresa selecionada para emissão de NFSe'
      });
    }
  }

  onIssRetidoChange(valor: string) {
    if (valor !== '1') {
      this.nfseData.servico.responsavelRetencao = '';
    }
  }

  arredondarABNT(valor: number): number {
    const factor = 100;
    const temp = valor * factor;
    const intPart = Math.trunc(temp);
    const nextDigit = Math.trunc((temp - intPart) * 10);
    const isOdd = intPart % 2 !== 0;
  
    if (nextDigit < 5) {
      return intPart / factor;
    }
  
    if (nextDigit > 5 || (nextDigit === 5 && ((temp * 10) % 10 !== 0))) {
      return (intPart + 1) / factor;
    }
  
    return (isOdd ? intPart + 1 : intPart) / factor;
  }

  calcularISS() {
    const valorServicos = parseFloat((this.nfseData.servico.valores.valorServicos || '0').toString().replace(/\./g, '').replace(',', '.'));
    const valorDeducoes = parseFloat((this.nfseData.servico.valores.valorDeducoes || '0').toString().replace(/\./g, '').replace(',', '.'));
    const descontoIncondicionado = parseFloat((this.nfseData.servico.valores.descontoIncondicionado || '0').toString().replace(/\./g, '').replace(',', '.'));
    
    // CORRIGIDO: não remove ponto, só troca vírgula por ponto
    const aliquota = parseFloat((this.nfseData.servico.valores.aliquota || '0').toString().replace(',', '.'));
  
    const baseCalculo = valorServicos - descontoIncondicionado - valorDeducoes;
    const baseCalculoPositivo = Math.max(0, baseCalculo);
  
    let valorIss = (baseCalculoPositivo * aliquota) / 100;
    valorIss = this.arredondarABNT(valorIss);
  
    this.nfseData.servico.valores.baseCalculo = baseCalculoPositivo.toFixed(2);
    this.nfseData.servico.valores.valorIss = valorIss.toFixed(2);
  }






  isCpfValido(CPF_CNPJ: string): boolean {
    if (!CPF_CNPJ || CPF_CNPJ.length !== 11) return false;
    let soma = 0, resto;
    if (/^(\d)\1+$/.test(CPF_CNPJ)) return false; // Evita CPFs com números repetidos (ex: 00000000000)
    for (let i = 1; i <= 9; i++) soma += parseInt(CPF_CNPJ[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(CPF_CNPJ[9])) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(CPF_CNPJ[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(CPF_CNPJ[10]);
  }

  /** Valida se um CNPJ é válido */
  isCnpjValido(CNPJ: string): boolean {
    if (!CNPJ || CNPJ.length !== 14) return false;
    if (/^(\d)\1+$/.test(CNPJ)) return false; // Evita CNPJs com números repetidos

    let tamanho = CNPJ.length - 2;
    let numeros = CNPJ.substring(0, tamanho);
    let digitos = CNPJ.substring(tamanho);
    let soma = 0, pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos[0])) return false;
    
    tamanho++;
    numeros = CNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos[1]);
  }

  /** Determina se um CPF ou CNPJ é válido */
  isCpfCnpjValido(value: string): boolean {
    const cleanedValue = value.replace(/\D/g, '');
    
    if (cleanedValue.length === 11) {
      return this.isCpfValido(cleanedValue);
    } else if (cleanedValue.length === 14) {
      return this.isCnpjValido(cleanedValue);
    }
    return false;
  }

  buscarpessoas() {
    if (!this.CPF_CNPJ && !this.nome) {
      this.showError('Informe um CPF, CNPJ ou Nome para realizar a busca.');
      return;
    }
  
    if (this.CPF_CNPJ) {
      // Altere para passar o CPF/CNPJ como parâmetro
      this.buscarPorCpf(this.CPF_CNPJ);
    } else {
      this.buscarPorNome();
    }
  }
  
  buscarPorCpf(cpfCnpj: string) {
    const cpfCnpjLimpo = cpfCnpj.replace(/\D/g, '');
    
    if (!this.isCpfCnpjValido(cpfCnpjLimpo)) {
      this.showError('CPF/CNPJ inválido');
      return;
    }
  
    this.pessoasService.buscarPorCpf(cpfCnpjLimpo).subscribe(
      (data) => {
        if (data) {
          this.preencherDadosTomador(data);
        } else {
          this.showError('Pessoa não encontrada');
        }
      },
      (error) => {
        console.error('Erro ao buscar pessoa:', error);
        this.showError('Erro na busca. Tente novamente.');
      }
    );
  }
  

  buscarPorNome() {
    this.pessoasService.buscarPorNome(this.nome).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.pessoasEncontrados = data;
          this.displayDialogUsuarios = true; // Agora o diálogo será aberto corretamente
        } else {
          this.showError('Nenhuma pessoa encontrada com este nome.');
        }
      },
      (error) => {
        console.error('Erro ao buscar por Nome:', error);
        this.showError('Erro ao buscar pessoa. Tente novamente.');
      }
    );
  }

  private preencherDadosTomador(pessoa: any) {
    // Dados básicos
    this.nfseData.tomador.razaoSocial = pessoa.NOME;
    this.nfseData.tomador.contato.email = pessoa.EMAIL;
    this.nfseData.tomador.contato.telefone = pessoa.TELEFONE_CELULAR;

      // Inscrição Municipal - adicione esta linha
    this.nfseData.tomador.identificacao.inscricaoMunicipal = pessoa.IM || '';
  
    // Endereço
    this.nfseData.tomador.endereco = {
      endereco: pessoa.RUA_LOGRADOURO,
      numero: pessoa.NUMERO_LOGRADOURO,
      complemento: pessoa.COMPLEMENTO_LOGRADOURO,
      bairro: pessoa.BAIRRO_LOGRADOURO,
      cep: pessoa.CEP,
      codigoMunicipio: pessoa.COD_IBGE,
      uf: pessoa.UF
    };
  
    // Forçar atualização da interface
    setTimeout(() => {
      this.cdRef.detectChanges();
    });
  }


  selecionarpessoas(pessoa: Pessoa) {
    this.resultado = pessoa; 
    this.nomeCliente = pessoa.NOME; 
    this.CPF_CNPJ_CLIENTE = pessoa.CPF_CNPJ; // Verifique se este valor está correto
    this.novaPessoa = { ...pessoa }; // Armazena todos os dados da pessoa
    this.displayDialogUsuarios = false;
  
    console.log("Cliente selecionado:", this.novaPessoa); 
    console.log("CPF_CNPJ do cliente selecionado:", this.CPF_CNPJ_CLIENTE); // Debug para verificar
  }

  selecionarCliente() {
    if (!this.cpfCnpjInput.trim()) {
      console.warn('Por favor, informe o CPF/CNPJ antes de selecionar um cliente.');
      return;
    }

    // Aqui você pode adicionar a lógica para preencher os dados do cliente após seleção
    console.log('Cliente selecionado:', this.cpfCnpjInput);
    this.displayDialogCPF = false; // Fecha o diálogo após selecionar o cliente
    this.nomeCliente = 'Nome do Cliente'; // Exemplo de preenchimento após selecionar
  }

  createPessoa() {
    console.log("Criando nova pessoa:", this.novaPessoa);
    // Aqui você pode chamar um serviço para salvar os dados no backend
    this.displayDialogNovaPessoa = false; // Fecha o diálogo após salvar
  }

    // Métodos de filtro atualizados
    filtrarCidadesPrestacao(uf: string): void {
      this.filteredCidadesPrestacao = this.cidades.filter(c => c.COD_UF === uf);
    }
  
    filtrarCidadesIncidencia(uf: string): void {
      this.filteredCidadesIncidencia = this.cidades.filter(c => c.COD_UF === uf);
    }

    carregarCidades(): void {
      this.nfseService.carregarCidades().subscribe({
        next: (cidades: Cidade[]) => {
          this.cidades = cidades;
          // Extrair UFs únicas
          this.ufs = [...new Set(cidades.map(c => c.COD_UF))].sort();
          
          // Selecionar Santa Maria como padrão
          this.selecionarCidadePadrao();
        },
        error: (err: any) => {
          console.error('Erro ao carregar cidades:', err);
        }
      });
    }
    
    // Adicione este novo método
    selecionarCidadePadrao(): void {
      const santaMaria = this.cidades.find(c => 
        c.NOME_CIDADE === this.defaultCidade && 
        c.COD_UF === this.defaultUf
      );
      
      if (santaMaria) {
        this.selectedCidadePrestacao = santaMaria;
        this.selectedCidadeIncidencia = santaMaria;
      }
      
      // Atualizar listas filtradas
      this.filteredCidadesPrestacao = this.cidades.filter(c => c.COD_UF === this.ufSelecionadaPrestacao);
      this.filteredCidadesIncidencia = this.cidades.filter(c => c.COD_UF === this.ufSelecionadaIncidencia);
    }

  filtrarCidadesPorUf(uf: string): any[] {
    return this.cidades.filter(c => c.uf === uf);
  }

  carregarDadosEmpresa(): void {
    if (!this.cnpj) return;
  
    this.loading = true;
    this.empresaService.buscarPorCnpj(this.cnpj).subscribe({
      next: (empresa) => {
        this.empresaSelecionada = empresa;
        console.log('Dados da empresa:', empresa);
        
        // Definir se é optante pelo Simples Nacional
        this.isOptanteSimplesNacional = empresa.OPTANTE_SN === "1";
        
        if (empresa.AMBIENTE_INTEGRACAO_ID) {
          this.carregarSerieRPS(empresa.AMBIENTE_INTEGRACAO_ID);
        }
        this.loading = false;
        
        // Atualizar estado dos campos
        this.atualizarEstadoCamposISS();
      },
      error: (err) => {
        console.error('Erro ao carregar empresa:', err);
        this.loading = false;
      }
    });
  }


  atualizarEstadoCamposISS(): void {
    // Verificar se o município de incidência é Santa Maria
    this.isMunicipioSantaMaria = this.selectedCidadeIncidencia?.NOME_CIDADE === 'SANTA MARIA';
    
    // Se for optante pelo Simples Nacional OU município Santa Maria, desabilita os campos
    const desabilitarCampos = this.isOptanteSimplesNacional || this.isMunicipioSantaMaria;
    
    // Atualizar o formulário conforme necessário
    if (desabilitarCampos) {
      this.nfseData.servico.valores.aliquota = '';
      this.nfseData.servico.valores.valorIss = '';
    }
  }

  carregarSerieRPS(ambienteIntegracaoId: number): void {
    this.webserviceService.getWebservice(ambienteIntegracaoId).subscribe({
      next: (resposta: any) => {
        console.log('Resposta completa do webservice:', resposta);
        
        // Verificação priorizando SERIE_RPS exatamente como vem da API
        const serie = resposta.SERIE_RPS || // Primeiro tenta o formato exato
                     resposta.serieRPS || 
                     resposta.SerieRPS || 
                     resposta.serie_rps || 
                     resposta.serie ||
                     '1';
  
        this.serieRPS = serie;
        this.nfseData.identificacao.serie = serie; // Atualiza também o formulário
        
        console.log('Série definida como:', this.serieRPS);
      },
      error: (err) => {
        console.error('Erro ao buscar série:', err);
        this.serieRPS = '1';
        this.nfseData.identificacao.serie = '1';
      }
    });
  }

  onSubmit(): void {
    if (!this.empresaSelecionada) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Nenhuma empresa selecionada para emissão da NFSe'
      });

      
      return;
    }
  
    this.loading = true;
     // Criar cópia dos dados para envio
  const dadosParaEnvio = JSON.parse(JSON.stringify(this.nfseData));

  // Remover campos de ISS se necessário
  if (this.isOptanteSimplesNacional || this.isMunicipioSantaMaria) {
    delete dadosParaEnvio.servico.valores.aliquota;
    delete dadosParaEnvio.servico.valores.valorIss;
  }

    
    // Formatar os dados no padrão que funciona (com tomador dentro de rpsList)
    const dadosEnvio = {
      prestador: {
        cnpj: this.empresaSelecionada.CNPJ,
        inscricaoMunicipal: this.empresaSelecionada.IM,
        razaoSocial: this.empresaSelecionada.RAZAO_SOCIAL
      },
      rpsList: [{
        identificacao: {
          serie: this.serieRPS,
          tipo: this.nfseData.identificacao.tipo,
          numero: this.nfseData.identificacao.numero
        },
        dataEmissao: this.nfseData.dataEmissao,
        status: parseInt(this.nfseData.status),
        competencia: this.nfseData.competencia,
        servico: {
          valores: {
            valorServicos: parseFloat(this.nfseData.servico.valores.valorServicos) || 0,
            valorDeducoes: parseFloat(this.nfseData.servico.valores.valorDeducoes) || 0,
            valorPis: parseFloat(this.nfseData.servico.valores.valorPis) || 0,
            valorCofins: parseFloat(this.nfseData.servico.valores.valorCofins) || 0,
            valorInss: parseFloat(this.nfseData.servico.valores.valorInss) || 0,
            valorIr: parseFloat(this.nfseData.servico.valores.valorIr) || 0,
            valorCsll: parseFloat(this.nfseData.servico.valores.valorCsll) || 0,
            outrasRetencoes: parseFloat(this.nfseData.servico.valores.outrasRetencoes) || 0,
            valorIss: parseFloat(this.nfseData.servico.valores.valorIss) || 0,
            aliquota: parseFloat(this.nfseData.servico.valores.aliquota) || 0,
            descontoIncondicionado: parseFloat(this.nfseData.servico.valores.descontoIncondicionado) || 0,
            descontoCondicionado: parseFloat(this.nfseData.servico.valores.descontoCondicionado) || 0
          },
          issRetido: parseInt(this.nfseData.servico.issRetido),
          responsavelRetencao: parseInt(this.nfseData.servico.responsavelRetencao),
          itemListaServico: this.nfseData.servico.itemListaServico || '',
          codigoCnae: this.nfseData.servico.codigoCnae || '',
          codigoTributacaoMunicipio: this.nfseData.servico.codigoTributacaoMunicipio || '',
          discriminacao: this.nfseData.servico.discriminacao || '',
          codigoMunicipio: this.selectedCidadePrestacao?.COD_IBGE.toString() || '',
          exigibilidadeISS: this.nfseData.servico.exigibilidadeISS || '',
          municipioIncidencia: this.selectedCidadeIncidencia?.COD_IBGE.toString() || ''
        },
        tomador: {  // Agora o tomador está dentro do objeto do RPS
          identificacao: {
            cpf: this.nfseData.tomador.identificacao.cpf || null,
            cnpj: this.nfseData.tomador.identificacao.cnpj || null,
            inscricaoMunicipal: this.nfseData.tomador.identificacao.inscricaoMunicipal || null,
          },
          razaoSocial: this.nfseData.tomador.razaoSocial,
          endereco: {
            endereco: this.nfseData.tomador.endereco.endereco,
            numero: this.nfseData.tomador.endereco.numero,
            complemento: this.nfseData.tomador.endereco.complemento,
            bairro: this.nfseData.tomador.endereco.bairro,
            codigoMunicipio: this.nfseData.tomador.endereco.codigoMunicipio,
            uf: this.nfseData.tomador.endereco.uf,
            cep: this.nfseData.tomador.endereco.cep
          },
          contato: {
            telefone: this.nfseData.tomador.contato.telefone,
            email: this.nfseData.tomador.contato.email
          }
        },
        optanteSimplesNacional: parseInt(this.nfseData.optanteSimplesNacional),
        incentivoFiscal: parseInt(this.nfseData.incentivoFiscal)
      }],
      optanteSimplesNacional: this.nfseData.optanteSimplesNacional,
      incentivoFiscal: this.nfseData.incentivoFiscal
    };
  
    console.log('Dados a serem enviados:', dadosEnvio);
  
    this.nfseService.enviarNfse(dadosEnvio).subscribe({
      next: () => {
        this.isEnvioSucesso = true;
        this.exibirMensagem = true;
        this.mensagem = 'NFSe emitida com sucesso!';
        this.loading = false;
      },
      error: (err) => {
        this.isEnvioSucesso = false;
        this.exibirMensagem = true;
        this.mensagem = 'Falha ao emitir NFSe: ' + err.message;
        this.loading = false;
      }
    });
  }

  onCidadeIncidenciaChange(event: any): void {
    this.selectedCidadeIncidencia = event.value;
    this.isMunicipioSantaMaria = this.selectedCidadeIncidencia?.NOME_CIDADE === 'SANTA MARIA';
    this.atualizarEstadoCamposISS();
  }

  private removerCamposVazios(obj: any): any {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    
    if (typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(this.removerCamposVazios).filter(item => item !== undefined);
    }
    
    const result: any = {};
    Object.keys(obj).forEach(key => {
      // Mantém o objeto prestador completo
      if (key === 'prestador') {
        result[key] = {
          cnpj: obj[key].cnpj || '',
          inscricaoMunicipal: obj[key].inscricaoMunicipal || ''
        };
        return;
      }
      
      const value = this.removerCamposVazios(obj[key]);
      if (value !== undefined && value !== '' && !(typeof value === 'object' && Object.keys(value).length === 0)) {
        result[key] = value;
      }
    });
    
    return Object.keys(result).length > 0 ? result : undefined;
  }
  

  formatarCpfCnpj(value: string): void {
    const cpfCnpjLimpo = value.replace(/\D/g, '');
    
    if (cpfCnpjLimpo.length <= 11) {
      this.nfseData.tomador.identificacao.cpf = cpfCnpjLimpo;
      this.nfseData.tomador.identificacao.cnpj = '';
    } else {
      this.nfseData.tomador.identificacao.cnpj = cpfCnpjLimpo;
      this.nfseData.tomador.identificacao.cpf = '';
    }
  
    // Adicione esta linha para chamar a busca com o valor formatado
    if (cpfCnpjLimpo.length === 11 || cpfCnpjLimpo.length === 14) {
      this.buscarPorCpf(cpfCnpjLimpo); // Passa o parâmetro correto
    }
  }

  buscarEnderecoPorCEP(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');
    
    if (cepLimpo.length !== 8) {
      this.showError('CEP inválido');
      return;
    }
  
    this.pessoasService.getEnderecoPorCEP(cepLimpo).subscribe(
      (endereco) => {
        this.nfseData.tomador.endereco = {
          ...this.nfseData.tomador.endereco,
          endereco: endereco.logradouro,
          bairro: endereco.bairro,
          codigoMunicipio: endereco.cod_ibge,
          uf: endereco.uf
        };
  
        // Encontra e exibe o nome da cidade correspondente ao código IBGE
        if (endereco.cod_ibge) {
          const cidadeEncontrada = this.cidades.find(c => c.COD_IBGE === endereco.cod_ibge);
          if (cidadeEncontrada) {
            this.nomeCidadeTomador = cidadeEncontrada.NOME_CIDADE;
          } else {
            this.nomeCidadeTomador = '';
          }
        } else {
          this.nomeCidadeTomador = '';
        }
      },
      (error) => {
        console.error('Erro ao buscar endereço:', error);
        this.showError('Erro ao buscar CEP');
        this.nomeCidadeTomador = '';
      }
    );
  }
  
    // Exibe mensagem de sucesso
    showSuccess(message: string): void {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: message,
      });
    }
  
    // Exibe mensagem de erro
    showError(message: string): void {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: message,
      });
    }
    
    atualizarCidadesTomador(): void {
      if (this.nfseData.tomador.endereco.uf) {
        this.filteredCidadesTomador = this.cidades.filter(c => c.COD_UF === this.nfseData.tomador.endereco.uf);
      } else {
        this.filteredCidadesTomador = [];
        this.selectedCidadeTomador = null;
      }
    }
    
    // Método para quando uma cidade é selecionada
    selecionarCidadeTomador(event: any): void {
      if (event.value) {
        this.nfseData.tomador.endereco.codigoMunicipio = event.value.COD_IBGE;
      } else {
        this.nfseData.tomador.endereco.codigoMunicipio = '';
      }
    }


   //////////////////////////////////////////////////////////// CNAE
//////////////////////////////////////////////////////////// CNAE
//////////////////////////////////////////////////////////// CNAE
//////////////////////////////////////////////////////////// CNAE
//////////////////////////////////////////////////////////// CNAE
  
  filtrarCnae(event: any) {
    if (event.query.length >= 3) {
      this.nfseService.buscarCNAE(event.query).subscribe({
        next: (data) => {
          this.cnaeFiltrado = data;
        },
        error: (error) => {
          console.error('Erro ao buscar CNAEs:', error);
        }
      });
    }
  }

// Método para buscar CNAEs
buscarCnaes() {
  if (!this.codCnaeBusca && !this.descCnaeBusca) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe pelo menos um critério de busca'
    });
    return;
  }

  this.carregandoCnaes = true;
  
  const params = {
    codigo: this.codCnaeBusca,
    descricao: this.descCnaeBusca
  };

  this.nfseService.buscarCNAE(params).subscribe({
    next: (cnaes) => {
      // Normaliza a resposta para sempre trabalhar com array
      this.cnaesEncontrados = Array.isArray(cnaes) ? cnaes : [cnaes];
      this.carregandoCnaes = false;
      
      if (this.cnaesEncontrados.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: 'Informação',
          detail: 'Nenhum CNAE encontrado com os critérios informados'
        });
      }
    },
    error: (error) => {
      console.error('Erro ao buscar CNAEs:', error);
      this.carregandoCnaes = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao buscar CNAEs'
      });
    }
  });
}


// Adicione este método para carregar os CNAEs
carregarCnaesDaEmpresa(CNPJ: string) {
  this.carregandoCnaesDaEmpresa = true;
  this.nfseService.getCnaesDaEmpresa(CNPJ).subscribe({
    next: (cnaes) => {
      this.cnaesDaEmpresa = Array.isArray(cnaes) ? cnaes : [];
      this.carregandoCnaesDaEmpresa = false;
    },
  });
}



buscarCnaeEspecifico(codigo: string) {
  this.nfseService.buscarCNAE({ codigo }).subscribe({
    next: (cnaes) => {
      if (cnaes.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'CNAE não encontrado',
          detail: `Nenhum CNAE encontrado com o código ${codigo}`
        });
      }
      this.cnaesEncontrados = cnaes;
    },
    error: (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro na busca',
        detail: error.message || 'Falha ao buscar CNAE'
      });
    }
  });
}



carregarCodigosTributacaoDaEmpresa(CNPJ: string) {
  this.carregandoCodigosTributacaoDaEmpresa = true;
  this.nfseService.getCodigoTributacaoMunicipioVinculados(CNPJ).subscribe({
    next: (codigos) => {
      // Se não houver códigos, retorna array vazio
      this.codigosTributacaoDaEmpresa = Array.isArray(codigos) ? codigos : [];
      this.carregandoCodigosTributacaoDaEmpresa = false;
    },
    error: (error) => {
      // Se for erro 404 (não encontrado), considera como array vazio
      if (error.status === 404) {
        this.codigosTributacaoDaEmpresa = [];
      } 
      this.carregandoCodigosTributacaoDaEmpresa = false;
    }
  });
}


filtrarITEMLC(event: any) {
  if (event.query.length >= 3) {
    this.nfseService.buscarITEMLC(event.query).subscribe({
      next: (data) => {
        this.ITEMLCFiltrado = data;
      },
      error: (error) => {
        console.error('Erro ao buscar ITEM LC:', error);
      }
    });
  }
}

buscarITEMLCs() {
if (!this.codITEMLCBusca && !this.descITEMLCBusca) {
  this.messageService.add({
    severity: 'warn',
    summary: 'Atenção',
    detail: 'Informe pelo menos um critério de busca'
  });
  return;
}

this.carregandoITEMLCs = true;

const params = {
  codigo: this.codITEMLCBusca,
  descricao: this.descITEMLCBusca
};

this.nfseService.buscarITEMLC(params).subscribe({
  next: (ITEMLCs) => {
    // Normaliza a resposta para sempre trabalhar com array
    this.ITEMLCsEncontrados = Array.isArray(ITEMLCs) ? ITEMLCs : [ITEMLCs];
    this.carregandoITEMLCs = false;
    
    if (this.ITEMLCsEncontrados.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Informação',
        detail: 'Nenhum ITEMLC encontrado com os critérios informados'
      });
    }
  },
  error: (error) => {
    console.error('Erro ao buscar ITEMLC:', error);
    this.carregandoITEMLCs = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: 'Falha ao buscar ITEMLC'
    });
  }
});
}


// Adicione este método para carregar os ITEMLC
carregarITEMLCsDaEmpresa(CNPJ: string) {
this.carregandoITEMLCsDaEmpresa = true;
this.nfseService.getITEMLCDaEmpresa(CNPJ).subscribe({
  next: (ITEMLC) => {
    this.ITEMLCsDaEmpresa = Array.isArray(ITEMLC) ? ITEMLC : [];
    this.carregandoITEMLCsDaEmpresa = false;
  },
});
}



buscarITEMLCEspecifico(codigo: string) {
this.nfseService.buscarITEMLC({ codigo }).subscribe({
  next: (ITEMLC) => {
    if (ITEMLC.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ITEMLC não encontrado',
        detail: `Nenhum ITEMLC encontrado com o código ${codigo}`
      });
    }
    this.ITEMLCsEncontrados = ITEMLC;
  },
  error: (error) => {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro na busca',
      detail: error.message || 'Falha ao buscar ITEMLC'
    });
  }
});
}

}