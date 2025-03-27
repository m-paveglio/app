import { Component, OnInit } from '@angular/core';
import { NfseService } from '../nfse.service';
import { MessageService } from 'primeng/api';
import { LoginService } from '../../../login/login.service';
import { EmpresasService } from '../../../login/usuarios/empresas/empresas.service';
import { WebserviceService } from '../../webservice/webservice.service';

@Component({
  selector: 'app-gerar-nfse',
  templateUrl: './gerar-nfse.component.html',
  styleUrls: ['./gerar-nfse.component.css'],
  providers: [MessageService]
})
export class GerarNfseComponent implements OnInit {
  exibirMensagem: boolean = false;
  isEnvioSucesso: boolean = false;
  mensagem: string = '';
  loading = false;

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
      exigibilidadeISS: '',
      municipioIncidencia: '',
      valores: {
        valorServicos: '0.00',
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
        issRetido: '2'
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
  
  cnpj: string | null = null;
  empresaSelecionada: any = null;
  inscricaoMunicipalManual: string = '';
  serieRPS: string = '';

  constructor(
    private nfseService: NfseService,
    private messageService: MessageService,
    private loginService: LoginService,
    private empresaService: EmpresasService,
    private webserviceService: WebserviceService
  ) {}

  ngOnInit(): void {
    // Obter o CNPJ da empresa logada
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;
    
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

  carregarDadosEmpresa(): void {
    if (!this.cnpj) return;
  
    this.loading = true;
    this.empresaService.buscarPorCnpj(this.cnpj).subscribe({
      next: (empresa) => {
        this.empresaSelecionada = empresa;
        console.log('Dados da empresa:', empresa); // Log completo
        
        if (empresa.AMBIENTE_INTEGRACAO_ID) {
          this.carregarSerieRPS(empresa.AMBIENTE_INTEGRACAO_ID);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar empresa:', err);
        this.loading = false;
      }
    });
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

      // Verificação adicional da série
      if (this.serieRPS === '1') {
        console.warn('Série está com valor padrão "1" - resposta da API:', {
          empresa: this.empresaSelecionada,
          ambienteId: this.empresaSelecionada?.AMBIENTE_INTEGRACAO_ID
        });
      }

    if (!this.empresaSelecionada.OPTANTE_SN) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Status do Simples Nacional não definido para esta empresa. Usando valor padrão (Não optante).'
      });
    }
    

    this.loading = true;
    
    const prestador = {
      cnpj: this.empresaSelecionada.CNPJ,
      inscricaoMunicipal: this.empresaSelecionada.IM
    };

    const optanteSimplesNacional = this.empresaSelecionada.OPTANTE_SN || '2';

    // Usar a série obtida do webservice
    const dadosEnvio = {
      identificacao: {
        numero: this.nfseData.identificacao.numero,
        serie: this.serieRPS, // Usa a série obtida
        tipo: this.nfseData.identificacao.tipo
      },
      dataEmissao: this.nfseData.dataEmissao,
      status: this.nfseData.status,
      competencia: this.nfseData.competencia,
      servico: {
        ...this.nfseData.servico,
        valores: {
          ...this.nfseData.servico.valores
        }
      },
      prestador: {
        cnpj: this.empresaSelecionada.CNPJ,
        inscricaoMunicipal: this.empresaSelecionada.IM
      },
      tomador: {
        ...this.nfseData.tomador
      },
      optanteSimplesNacional: optanteSimplesNacional, // Agora vindo da empresa
      incentivoFiscal: this.nfseData.incentivoFiscal,
      informacoesComplementares: this.nfseData.informacoesComplementares
    };

    // Remover campos vazios
    const dadosLimpos = this.removerCamposVazios(dadosEnvio);

    console.log('Dados a serem enviados:', dadosLimpos);

    this.nfseService.enviarNfse(dadosLimpos).subscribe({
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
  

  formatarCpfCnpj(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      this.nfseData.tomador.identificacao.cpf = value;
      this.nfseData.tomador.identificacao.cnpj = '';
    } else {
      this.nfseData.tomador.identificacao.cnpj = value;
      this.nfseData.tomador.identificacao.cpf = '';
    }
  }
}