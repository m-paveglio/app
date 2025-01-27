import { Component, OnInit } from '@angular/core';
import { ServicosService } from '../servicos.service';
import { LoginService } from '../../../login/login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-servicos-consultar',
  templateUrl: './servicos-consultar.component.html',
  styleUrls: ['./servicos-consultar.component.css'],
  providers: [MessageService],
})
export class ServicosConsultarComponent implements OnInit {
  servicos: any[] = []; // Lista de serviços carregados
  cnpj: string | null = null; // CNPJ logado
  isLoading = false; // Flag para controlar o carregamento da lista de serviços

  constructor(
    private servicosService: ServicosService,
    private loginService: LoginService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Obtém o CNPJ do serviço de login
    this.cnpj = this.loginService.getEmpresaSelecionada()?.CNPJ;
    if (this.cnpj) {
      this.loadServicos(); // Carrega os serviços ao encontrar o CNPJ logado
    } else {
      this.showError('CNPJ não encontrado para a empresa logada.');
    }
  }

  // Método para carregar os serviços do CNPJ logado
  async loadServicos(): Promise<void> {
    if (!this.cnpj) return;

    this.isLoading = true; // Ativa o loading
    try {
      // Passa o CNPJ para o método do serviço
      this.servicos = (await this.servicosService.getServicos(this.cnpj).toPromise()) ?? [];
    } catch (error) {
      this.showError('Erro ao carregar os serviços. Tente novamente.');
    } finally {
      this.isLoading = false; // Desativa o loading
    }
  }

  // Método para formatar o valor de exibição como R$ 10,00
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  }

  editServico(servico: any): void {
    // Redireciona ou abre um modal para editar o serviço selecionado
    console.log('Editando serviço:', servico);
  }
  
  async deleteServico(codServico: string): Promise<void> {
    this.isLoading = true;
    try {
      await this.servicosService.deleteServico(codServico).toPromise();
      this.showSuccess('Serviço excluído com sucesso!');
      this.loadServicos();
    } catch (error) {
      this.showError('Erro ao excluir o serviço. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
  

}