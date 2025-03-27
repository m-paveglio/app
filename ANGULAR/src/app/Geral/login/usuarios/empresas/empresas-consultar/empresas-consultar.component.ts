import { Component } from '@angular/core';
import { EmpresasService } from '../empresas.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ChangeDetectorRef } from '@angular/core';
import { cnpj } from 'cpf-cnpj-validator'; // Importando a biblioteca

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
  CNPJ: string = '';
  NOME: string = '';
  resultado: any = null;
  novaEmpresa: any = {};
  editMode = false;
  OPTANTE_SN = [
    { nome: 'OPTANTE', codigo: '1' },
    { nome: 'NÃO OPTANTE', codigo: '2' }
  ];
  EmpresasEncontradas: any[] = [];
  OPTANTE_SN_nome: string = '';
  AMBIENTE_INTEGRACAO_NOME: string = '';
  selectedFile: File | null = null;
  certificadoSelecionado: File | null = null;
  senhaCertificado: string = '';
  webservicesDisponiveis: any[] = []; // Nova propriedade para armazenar webservices
  AMBIENTE_INTEGRACAO_ID: any[] = []; // Agora será populado dinamicamente

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

          // Converte TIPO_USER para exibir o nome correspondente em outra propriedade
          const OPTANTE_SN = this.OPTANTE_SN.find(t => t.codigo === this.resultado.OPTANTE_SN);
          this.resultado.OPTANTE_SN_nome = OPTANTE_SN ? OPTANTE_SN.nome : '';

          console.log(this.resultado);
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
            this.resultado = data;
          } else if (!Array.isArray(data)) {
            this.resultado = data;
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
      AMBIENTE_INTEGRACAO_ID: this.resultado.AMBIENTE_INTEGRACAO_ID // Campo corrigido
    };
  
    this.EmpresasService.atualizarEmpresa(this.resultado.CNPJ, updatePayload).subscribe(
      () => {
        this.editMode = false;
        this.showSuccess('Empresa atualizada com sucesso!');
      },
      (error) => {
        console.error('Erro ao atualizar empresa:', error);
        this.showError('Erro ao atualizar empresa');
      }
    );
  }


  selecionarEmpresa(empresa: any) {
    // Define o usuário selecionado como o `resultado`
    this.EmpresasService.buscarPorCnpj(empresa.CNPJ).subscribe(
      (data) => {
        this.resultado = data;
        this.EmpresasEncontradas = []; // Limpa a lista de opções
      },
      (error) => {
        console.error('Erro ao selecionar empresa:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao selecionar empresa');
        }
      }
    );
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
      },
      (error) => {
        console.error('Erro ao editar Empresa:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao buscar Empresa para edição.');
        }
      }
    );
  }

}
