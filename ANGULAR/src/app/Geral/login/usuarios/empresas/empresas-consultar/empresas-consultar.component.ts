import { Component } from '@angular/core';
import { EmpresasService } from '../empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { cnpj } from 'cpf-cnpj-validator'; // Importando a biblioteca

interface CnaeVinculado {
  COD_CNAE: string;
  DESC_CNAE: string;
}

interface CodigoTricodigoTributacaoParaAdicionar {
  COD_ATIVIDADE: string;
  DESC_ATIVIDADE?: string; // Adicione se tiver descrição
}

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-empresas-consultar',
  templateUrl: './empresas-consultar.component.html',
  styleUrls: ['./empresas-consultar.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class EmpresasConsultarComponent {
  cols!: Column[];
  cnaesDaEmpresa: CnaeVinculado[] = [];
  CNPJ: string = '';
  NOME: string = '';
  resultado: any = null;
  novaEmpresa: any = {};
  editMode = false;
  OPTANTE_SN = [
    { nome: 'OPTANTE SN', codigo: '1' },
    { nome: 'NÃO OPTANTE SN', codigo: '2' }
  ];
  OPTANTE_SN_nome: string = '';

  OPTANTE_MEI = [
    { nome: 'OPTANTE MEI', codigo: '1' },
    { nome: 'NÃO OPTANTE MEI', codigo: '2' }
  ];
  OPTANTE_MEI_nome: string = '';
  EmpresasEncontradas: any[] = [];
  AMBIENTE_INTEGRACAO_NOME: string = '';
  selectedFile: File | null = null;
  certificadoSelecionado: File | null = null;
  senhaCertificado: string = '';
  webservicesDisponiveis: any[] = []; // Nova propriedade para armazenar webservices
  AMBIENTE_INTEGRACAO_ID: any[] = []; // Agora será populado dinamicamente]
  certificadoCarregado: boolean = false;
  // Adicione estas variáveis na classe
  dataUploadCertificado: string | null = null;
  certificadoEnviado: boolean = false;
  valoresOriginais: any = {};
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
  mostrarAdicionarCodigoTributacao: boolean = false;
  codigosTributacaoDaEmpresa: any[] = [];
  carregandoCodigosTributacaoDaEmpresa: boolean = false;
  codigoTributacaoParaAdicionar = {
    COD_ATIVIDADE: '',
    DESC_ATIVIDADE: ''
  };
  mostrarDialogoAtividade: boolean = false;
  codAtividadeBusca: string = '';
  descAtividadeBusca: string = '';
  atividadesEncontradas: any[] = [];
  carregandoAtividades: boolean = false;
  mostrarDialogoNovaAtividade: boolean = false;
  novaAtividade = {
    COD_ATIVIDADE: '',
    DESC_ATIVIDADE: ''
  };

  constructor(
    private EmpresasService: EmpresasService,
    public dialog: MatDialog,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.carregarWebservicesDisponiveis();
  }

  carregarWebservicesDisponiveis() {
    this.EmpresasService.getWebservices().subscribe(
      (webservices) => {
        this.webservicesDisponiveis = webservices; // Armazena a lista original
        console.log('Webservices carregados:', this.webservicesDisponiveis);
        
        // Atualiza a visualização se necessário
        if (this.resultado && this.resultado.AMBIENTE_INTEGRACAO_ID) {
          this.cd.detectChanges(); // Força a detecção de mudanças
        }
      },
      (error) => {
        console.error('Erro ao carregar webservices:', error);
        this.showError('Erro ao carregar ambientes de integração disponíveis');
        this.webservicesDisponiveis = []; // Limpa a lista em caso de erro
      }
    );
  }

  getNomeWebservice(id: number): string {
    if (!id) return 'Não selecionado';
    
    // Verifica se webservicesDisponiveis está carregado
    if (!this.webservicesDisponiveis || this.webservicesDisponiveis.length === 0) {
      return 'Carregando...';
    }
    
    const ws = this.webservicesDisponiveis.find(w => w.ID === id);
    return ws ? ws.NOME_CIDADE : `WebService ID: ${id}`;
  }

  buscarEmpresa() {
    // Verifica se o CNPJ está preenchido e válido para busca por CNPJ
    if (this.CNPJ && this.isCnpjValido(this.CNPJ)) {
      this.buscarPorCnpj();
    } 
    // Caso CNPJ esteja vazio, tenta buscar por nome
    else if (this.NOME) {
      this.buscarPorNome();
    } 
    // Mensagem de erro caso ambos estejam inválidos
  }

  buscarPorCnpj() {
    if (!this.isCnpjValido(this.CNPJ)) {
      this.showError('CNPJ inválido!');
      return;
    }
  
    this.EmpresasService.buscarPorCnpj(this.CNPJ).subscribe(
      (data) => {
        if (data && Object.keys(data).length > 0) {
          this.resultado = data;
          
          // Carrega os dados do certificado
          this.certificadoEnviado = !!data.certificado;
          this.senhaCertificado = data.senha || '';
          this.dataUploadCertificado = data.data_upload || null;
          
          // Carrega os CNAEs da empresa
          this.carregarCnaesDaEmpresa(data.CNPJ);
          this.carregarCodigosTributacaoDaEmpresa(data.CNPJ);
          
          const OPTANTE_SN = this.OPTANTE_SN.find(t => t.codigo === this.resultado.OPTANTE_SN);
          this.resultado.OPTANTE_SN_nome = OPTANTE_SN ? OPTANTE_SN.nome : '';

          const OPTANTE_MEI = this.OPTANTE_MEI.find(t => t.codigo === this.resultado.OPTANTE_MEI);
          this.resultado.OPTANTE_MEI_nome = OPTANTE_MEI ? OPTANTE_MEI.nome : '';
        } else {
          this.showError('Empresa não existe no banco de dados.');
          this.resultado = null;
        }
      },
      (error) => {
        console.error('Erro ao buscar por CNPJ:', error);
        this.showError('Erro ao buscar CNPJ. Por favor, tente novamente.');
        this.resultado = null;
      }
    );
  }

  buscarPorNome() {
    this.EmpresasService.buscarPorNome(this.NOME).subscribe(
      (data) => {
        if (data) {
          if (Array.isArray(data) && data.length > 0) {
            // Para busca por nome, não carregamos certificado até selecionar um CNPJ
            this.EmpresasEncontradas = data.map(empresa => ({
              ...empresa,
              OPTANTE_SN_nome: this.getOptanteSN(empresa.OPTANTE_SN),
              OPTANTE_MEI_nome: this.getOptanteSN(empresa.OPTANTE_MEI)
            }));
          } else if (!Array.isArray(data)) {
            this.resultado = data;
            // Carrega certificado se retornar direto um resultado
            this.certificadoEnviado = !!data.certificado;
            this.senhaCertificado = data.senha || '';
            this.dataUploadCertificado = data.data_upload || null;
          }
        } else {
          this.showError('Empresa não encontrada pelo nome.');
          this.resultado = null;
        }
      },
      (error) => {
        console.error('Erro ao buscar por Nome:', error);
        this.showError('Erro ao buscar Nome. Por favor, tente novamente.');
        this.resultado = null;
      }
    );
  }
  isCnpjValido(cnpjStr: string): boolean {
    return cnpj.isValid(cnpjStr); // Validação usando a biblioteca
  }

  salvarEmpresa() {
    const updatePayload = {
      CNPJ: this.resultado.CNPJ,
      NOME: this.resultado.NOME,
      IM: this.resultado.IM,
      OPTANTE_SN: this.resultado.OPTANTE_SN,
      OPTANTE_MEI: this.resultado.OPTANTE_MEI,
      AMBIENTE_INTEGRACAO_ID: this.resultado.AMBIENTE_INTEGRACAO_ID
    };
    
    this.EmpresasService.atualizarEmpresa(this.resultado.CNPJ, updatePayload).subscribe(
      () => {
        this.editMode = false;
        this.showSuccess('Empresa atualizada com sucesso!');
        
        // Se tem certificado para enviar, faz o upload
        if (this.certificadoSelecionado && this.senhaCertificado) {
          this.enviarCertificado();
        }
      },
      (error) => {
        console.error('Erro ao atualizar empresa:', error);
        this.showError('Erro ao atualizar empresa');
      }
    );
  }

  get senhaMascarada(): string {
    return this.senhaCertificado ? '********' : '';
  }


  selecionarEmpresa(empresa: any) {
    this.EmpresasService.buscarPorCnpj(empresa.CNPJ).subscribe({
      next: (data) => {
        this.resultado = data;
        this.EmpresasEncontradas = [];
        
        // Carrega dados do certificado
        this.certificadoEnviado = !!data.certificado;
        this.senhaCertificado = data.senha || '';
        this.dataUploadCertificado = data.data_upload || null;
        
        // Carrega os CNAEs da empresa
        this.carregarCnaesDaEmpresa(data.CNPJ);
        this.certificadoCarregado = true;
        this.carregarCodigosTributacaoDaEmpresa(data.CNPJ);
      },
      error: (error) => {
        console.error('Erro ao selecionar empresa:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao selecionar empresa');
        }
      }
    });
  }
  
  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('Empresa já existe')) {
      this.showError('Erro: a Empresa já existe.');
    } else if (mensagemErro.includes('campos obrigatórios')) {
      this.showError('Erro: preencha todos os campos obrigatórios.');
    } else {
      this.showError('Erro ao cadastrar empresa');
    }
  }

  showSuccess(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem });
  }

  showError(mensagem: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem });
  }

  getOptanteSN(codigo: string) {
    let OPTANTE_SN = this.OPTANTE_SN.find(u => u.codigo === codigo);
    return OPTANTE_SN ? OPTANTE_SN.nome : '';
  }

  getOptanteMEI(codigo: string) {
    let OPTANTE_MEI = this.OPTANTE_MEI.find(u => u.codigo === codigo);
    return OPTANTE_MEI ? OPTANTE_MEI.nome : '';
  }

  getINTEGRACAO(codigo: string) {
    let AMBIENTE_INTEGRACAO = this.AMBIENTE_INTEGRACAO_ID.find(u => u.codigo === codigo);
    return AMBIENTE_INTEGRACAO ? AMBIENTE_INTEGRACAO.nome : '';
  }

  excluirEmpresa(CNPJ: string) {
    this.EmpresasService.excluirEmpresa(CNPJ).subscribe(
      () => {
        this.resultado = null;
        this.showSuccess('Empresa excluída com sucesso!');
      },
      (error) => {
        console.error('Erro ao excluir Empresa:', error);
        this.showError('Erro ao excluir a Empresa.');
      }
    );
  }

// Método chamado quando o webservice é alterado
  onAmbienteIntegracaoChange(event: any) {
    // Você pode adicionar lógica adicional aqui se necessário
    console.log('WebService selecionado:', event.value);
  }

  confirmarExclusao() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir a Empresa?',
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: "p-button-danger p-button-text",
      rejectButtonStyleClass: "p-button-text",
      acceptIcon: "none",
      rejectIcon: "none",
      acceptLabel: "Sim",
      rejectLabel: "Não",
      accept: () => {
        this.excluirEmpresa(this.resultado.CNPJ);
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'Rejeição', detail: 'Empresa Não Deletada' });
      }
    });
  }

  editarEmpresa(CNPJ: string) {
    this.EmpresasService.buscarPorCnpj(CNPJ).subscribe(
      (data) => {
        this.resultado = data;
        this.editMode = true;
        this.certificadoCarregado = true;
        this.certificadoEnviado = !!data.certificado;
        
        // Salva os valores originais para possível cancelamento
        this.valoresOriginais = {
          ...data,
          senha: this.senhaCertificado,
          data_upload: this.dataUploadCertificado
        };
      },
      (error) => {
        console.error('Erro ao editar Empresa:', error);
        this.showError('Erro ao buscar Empresa para edição.');
      }
    );
  }

  onCertificadoSelecionado(event: any): void {
    if (event.files && event.files.length > 0) {
      this.certificadoSelecionado = event.files[0];
      this.certificadoCarregado = true;
      this.messageService.add({
        severity: 'info',
        summary: 'Certificado selecionado',
        detail: this.certificadoSelecionado?.name || 'Arquivo sem nome'
      });
    }
  }

  enviarCertificado(): void {
    if (!this.resultado?.CNPJ) {
      this.showError('CNPJ não disponível');
      return;
    }
  
    if (!this.certificadoSelecionado) {
      this.showError('Selecione um certificado primeiro');
      return;
    }
  
    if (!this.senhaCertificado) {
      this.showError('Informe a senha do certificado');
      return;
    }
  
    this.EmpresasService.enviarCertificado(
      this.resultado.CNPJ,
      this.certificadoSelecionado,
      this.senhaCertificado
    ).subscribe({
      next: () => {
        this.showSuccess('Certificado enviado com sucesso');
        this.certificadoCarregado = true;
      },
      error: (err) => {
        this.showError('Falha ao enviar certificado: ' + (err.error?.message || err.message));
      }
    });
  }

  cancelarEdicao() {
    if (this.resultado?.CNPJ) {
      this.EmpresasService.buscarPorCnpj(this.resultado.CNPJ).subscribe(
        (data) => {
          this.resultado = data;
          this.editMode = false;
          this.certificadoEnviado = !!data.certificado;
          this.senhaCertificado = data.senha || '';
          this.dataUploadCertificado = data.data_upload || null;
        },
        (error) => {
          console.error('Erro ao cancelar edição:', error);
          this.showError('Erro ao cancelar edição');
        }
      );
    } else {
      this.editMode = false;
    }
  }

  
  removerCnae(COD_CNAE: string) {
    if (this.resultado?.CNPJ && COD_CNAE) {
      this.confirmationService.confirm({
        message: 'Tem certeza que deseja remover este CNAE?',
        accept: () => {
          this.EmpresasService.removerCnaeEmpresa(this.resultado.CNPJ, COD_CNAE).subscribe({
            next: () => {
              this.carregarCnaesDaEmpresa(this.CNPJ);
            },
            error: (error) => {
              console.error('Erro ao remover CNAE:', error);
            }
          });
        }
      });
    }
  }
  
  filtrarCnae(event: any) {
    if (event.query.length >= 3) {
      this.EmpresasService.buscarCNAE(event.query).subscribe({
        next: (data) => {
          this.cnaeFiltrado = data;
        },
        error: (error) => {
          console.error('Erro ao buscar CNAEs:', error);
        }
      });
    }
  }


abrirDialogoCnae() {
  this.mostrarDialogoCnae = true;
  this.codCnaeBusca = '';
  this.descCnaeBusca = '';
  this.cnaesEncontrados = [];
}

// Método para fechar o diálogo
fecharDialogoCnae() {
  this.mostrarDialogoCnae = false;
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

  this.EmpresasService.buscarCNAE(params).subscribe({
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



// Método para selecionar um CNAE para adicionar
selecionarCnaeParaAdicionar(cnae: any) {
  this.EmpresasService.adicionarCnae(this.CNPJ, cnae.COD_CNAE).subscribe(
    () => {
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'CNAE adicionado!' });
      this.cnaesDaEmpresa.push(cnae);
      this.fecharDialogoCnae();
    },
    (erro) => {
      if (erro.status === 409) {
        this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Este CNAE já está vinculado!' });
      } else {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: erro.error?.message || 'Erro ao adicionar CNAE!' });
      }
    }
  );
}

// Método para adicionar o CNAE
adicionarCnae(codCnae: string) {
  if (!this.resultado?.CNPJ) return;

  this.EmpresasService.adicionarCnaeEmpresa(this.resultado.CNPJ, codCnae).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'CNAE adicionado com sucesso!'
      });
      this.carregarCnaesDaEmpresa(this.CNPJ)
    },
    error: (error) => {
      console.error('Erro ao adicionar CNAE:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Falha ao adicionar CNAE'
      });
    }
  });
}

// Adicione este método para carregar os CNAEs
carregarCnaesDaEmpresa(CNPJ: string) {
  this.carregandoCnaesDaEmpresa = true;
  this.EmpresasService.getCnaesDaEmpresa(CNPJ).subscribe({
    next: (cnaes) => {
      this.cnaesDaEmpresa = Array.isArray(cnaes) ? cnaes : [];
      this.carregandoCnaesDaEmpresa = false;
    },
  });
}



buscarCnaeEspecifico(codigo: string) {
  this.EmpresasService.buscarCNAE({ codigo }).subscribe({
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

// Método para habilitar os inputs de adição
habilitarAdicaoCodigoTributacao() {
  this.codigoTributacaoParaAdicionar = { COD_ATIVIDADE: '', DESC_ATIVIDADE: '' };
  this.mostrarAdicionarCodigoTributacao = true;
}

// Método para adicionar código de tributação
adicionarCodigoTributacao() {
  if (!this.codigoTributacaoParaAdicionar.COD_ATIVIDADE) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o código da atividade'
    });
    return;
  }

  if (!this.resultado?.CNPJ) {
    this.showError('CNPJ não disponível');
    return;
  }

  const payload = {
    CNPJ: this.resultado.CNPJ,
    COD_ATIVIDADE: this.codigoTributacaoParaAdicionar.COD_ATIVIDADE,
    DESC_ATIVIDADE: this.codigoTributacaoParaAdicionar.DESC_ATIVIDADE || undefined // Alterado de null para undefined
  };

  this.EmpresasService.adicionarCodigoTributacaoMunicipio(payload).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Código de tributação adicionado com sucesso!'
      });
      this.mostrarAdicionarCodigoTributacao = false;
      this.carregarCodigosTributacaoDaEmpresa(this.resultado.CNPJ);
    },
    error: (error) => {
      console.error('Erro ao adicionar código de tributação:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.error?.message || 'Falha ao adicionar código de tributação'
      });
    }
  });
}

// Método para remover código de tributação
removerCodigoTributacao(COD_ATIVIDADE: string) {
  this.confirmationService.confirm({
    message: 'Tem certeza que deseja remover este código de tributação?',
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    accept: () => {
      this.EmpresasService.removerCodigoTributacaoMunicipio(this.resultado.CNPJ, COD_ATIVIDADE).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Código de tributação removido com sucesso!'
          });
          this.carregarCodigosTributacaoDaEmpresa(this.resultado.CNPJ);
        },
        error: (error) => {
          console.error('Erro ao remover código de tributação:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Falha ao remover código de tributação'
          });
        }
      });
    }
  });
}

// Método para carregar os códigos de tributação da empresa (mantém o mesmo)
carregarCodigosTributacaoDaEmpresa(CNPJ: string) {
  this.carregandoCodigosTributacaoDaEmpresa = true;
  this.EmpresasService.getCodigoTributacaoMunicipioVinculados(CNPJ).subscribe({
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

// Método para abrir o diálogo
abrirDialogoNovaAtividade() {
  this.mostrarDialogoNovaAtividade = true;
  this.novaAtividade = { COD_ATIVIDADE: '', DESC_ATIVIDADE: '' };
}

// Método para fechar o diálogo
fecharDialogoNovaAtividade() {
  this.mostrarDialogoNovaAtividade = false;
}

// Método para adicionar nova atividade
adicionarNovaAtividade() {
  if (!this.novaAtividade.COD_ATIVIDADE) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: 'Informe o código da atividade'
    });
    return;
  }

  if (!this.resultado?.CNPJ) {
    this.showError('CNPJ não disponível');
    return;
  }

  this.EmpresasService.adicionarCodigoTributacaoMunicipio({
    CNPJ: this.resultado.CNPJ,
    COD_ATIVIDADE: this.novaAtividade.COD_ATIVIDADE,
    DESC_ATIVIDADE: this.novaAtividade.DESC_ATIVIDADE || undefined
  }).subscribe({
    next: () => {
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Atividade adicionada com sucesso!'
      });
      this.fecharDialogoNovaAtividade();
      this.carregarCodigosTributacaoDaEmpresa(this.resultado.CNPJ);
    },
    error: (error) => {
      console.error('Erro ao adicionar atividade:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: error.error?.message || 'Falha ao adicionar atividade'
      });
    }
  });
}
}
