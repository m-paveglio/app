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

  async loadServicos(): Promise<void> {
    if (!this.cnpj) return;
  
    this.isLoading = true;
    try {
      const resposta = await this.servicosService.getServicos(this.cnpj).toPromise();
      this.servicos = (Array.isArray(resposta) ? resposta : resposta?.data || []).map((servico) => ({
        ...servico,
        codServico: servico.COD_SERVICO, // Renomeia COD_SERVICO para codServico
        isEditing: false, // Adiciona a flag isEditing
      }));
      console.log('Serviços carregados:', this.servicos);
    } catch (error) {
      this.showError('Erro ao carregar os serviços. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  formatCurrencyInput(event: any, servico: any): void {
    const rawValue = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    const numericValue = parseFloat(rawValue) / 100; // Divide por 100 para ajustar ao formato monetário
    servico.VALOR = numericValue; // Atualiza o valor bruto no modelo
    event.target.value = this.formatCurrency(numericValue); // Atualiza o campo com o valor formatado
  }

  formatItemLC(servico: any): void {
    const rawValue = String(servico.ITEM_LC).replace(/[^0-9.]/g, ''); // Remove caracteres inválidos
    servico.ITEM_LC = rawValue.slice(0, 5); // Garante o limite de 5 caracteres
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }

  startEditing(servico: any): void {
    this.servicos.forEach((s) => (s.isEditing = false));
    servico.isEditing = true;
  
    // Certifique-se de que o valor esteja numérico ao começar a editar
    servico.VALOR = parseFloat(String(servico.VALOR).replace(/\D/g, '')) / 100;
  }

  async saveServico(servico: any): Promise<void> {
    console.log('Tentando salvar o serviço:', servico);
  
    if (!servico || !servico.codServico) {
      this.showError('Erro: Serviço inválido ou código do serviço não encontrado.');
      console.error('Serviço inválido ou código do serviço não encontrado:', servico);
      return;
    }
  
    try {
      console.log('Chamando API para atualizar o serviço com código:', servico.codServico);
      await this.servicosService.updateServico(servico.codServico, servico).toPromise();
  
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Serviço atualizado com sucesso!',
      });
  
      console.log('Serviço salvo com sucesso:', servico);
      servico.isEditing = false; // Sai do modo de edição
      this.loadServicos(); // Atualiza a lista
    } catch (error) {
      console.error('Erro ao salvar o serviço:', error);
      this.showError('Erro ao salvar o serviço. Tente novamente.');
    }
  }

  confirmarExclusaoServico(servico: any) {
    if (!servico || !servico.codServico) {
      this.showError('Erro: Código do serviço não encontrado.');
      return;
    }
  
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o serviço "${servico.DESC_SERVICO}"?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',  // Botão de aceitação customizado
      rejectButtonStyleClass: 'p-button-text',  // Botão de rejeição customizado
      acceptIcon: 'none',  // Remove o ícone do botão de aceitação
      rejectIcon: 'none',  // Remove o ícone do botão de rejeição
      acceptLabel: 'Sim',  // Texto do botão de aceitação
      rejectLabel: 'Não',  // Texto do botão de rejeição
      accept: () => {
        this.excluirServico(servico.codServico);  // Excluir o serviço
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'A exclusão foi cancelada.',  // Mensagem ao cancelar a exclusão
        });
      },
    });
  }

  async excluirServico(codServico: string): Promise<void> {
    if (!codServico) {
      this.showError('Erro: Código do serviço não encontrado.');
      return;
    }
  
    try {
      console.log('Excluindo serviço com código:', codServico);
      await this.servicosService.deleteServico(codServico).toPromise();
  
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Serviço excluído com sucesso!',
      });
  
      // Atualiza a lista de serviços
      this.servicos = this.servicos.filter((servico) => servico.codServico !== codServico);
    } catch (error) {
      console.error('Erro ao excluir o serviço:', error);
      this.showError('Erro ao excluir o serviço. Tente novamente.');
    }
  }

  cancelEditing(servico: any): void {
    // Restaura os valores originais do serviço (recarrega da API)
    const originalServico = this.servicos.find((s) => s.codServico === servico.codServico);
    if (originalServico) {
      Object.assign(servico, { ...originalServico });
    }
  
    // Sai do modo de edição
    servico.isEditing = false;
    console.log('Edição cancelada para o serviço:', servico);
  }
}
