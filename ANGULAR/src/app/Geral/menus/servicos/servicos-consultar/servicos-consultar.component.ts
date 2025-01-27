import { Component, OnInit } from '@angular/core';
import { ServicosService } from '../servicos.service';
import { LoginService } from '../../../login/login.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-servicos-consultar',
  templateUrl: './servicos-consultar.component.html',
  styleUrls: ['./servicos-consultar.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class ServicosConsultarComponent implements OnInit {
  servicos: any[] = []; // Lista de serviços carregados
  cnpj: string | null = null; // CNPJ logado
  isLoading = false; // Flag para controlar o carregamento da lista de serviços
  editMode = false; // Flag para verificar se o modo de edição está ativo
  selectedServico: any | null = null; // Serviço selecionado para edição

  constructor(
    private servicosService: ServicosService,
    private loginService: LoginService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cnpj = this.loginService.getEmpresaSelecionada()?.CNPJ;
    if (this.cnpj) {
      this.loadServicos();
    } else {
      this.showError('CNPJ não encontrado para a empresa logada.');
    }
  }


  
  // Carrega os serviços vinculados ao CNPJ logado
  async loadServicos(): Promise<void> {
    if (!this.cnpj) return;

    this.isLoading = true;
    try {
      const resposta = await this.servicosService.getServicos(this.cnpj).toPromise();
      this.servicos = Array.isArray(resposta) ? resposta : [resposta];
    } catch (error) {
      this.showError('Erro ao carregar os serviços. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  abrirDialogoEdicao(servico: any): void {
    this.editMode = true;
    this.selectedServico = { ...servico }; // Clona o serviço para evitar alterações diretas
  }

  async salvarServico(): Promise<void> {
    if (!this.selectedServico) return;

    try {
      await this.servicosService
        .updateServico(this.selectedServico.codServico, this.selectedServico)
        .toPromise();

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Serviço atualizado com sucesso!',
      });

      this.loadServicos(); // Recarrega os serviços após salvar
      this.cancelarEdicao(); // Fecha o modal
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao salvar o serviço. Tente novamente.',
      });
    }
  }

  // Cancela a edição e fecha o modal
  cancelarEdicao(): void {
    this.editMode = false;
    this.selectedServico = null;
  }

  // Confirma a exclusão do serviço
  confirmarExclusaoServico(servico: any): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o serviço "${servico.DESC_SERVICO}"?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.excluirServico(servico.codServico);
      },
    });
  }

  // Exclui o serviço
  async excluirServico(codServico: string): Promise<void> {
    try {
      await this.servicosService.deleteServico(codServico).toPromise();

      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Serviço excluído com sucesso!',
      });

      this.loadServicos(); // Recarrega os serviços após excluir
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao excluir o serviço. Tente novamente.',
      });
    }
  }


  // Formata valores em BRL
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  // Ativa o modo de edição
  editServico(servico: any): void {
    this.editMode = true;
    this.selectedServico = { ...servico }; // Clona o serviço para evitar alterações diretas
  }

 
  // Exibe mensagens de sucesso
  showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  // Exibe mensagens de erro
  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
}
