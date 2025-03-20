import { Component, OnInit } from '@angular/core';
import { ServicosService } from '../servicos.service';
import { LoginService } from '../../../login/login.service';
import { FormBuilder } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-servicos-incluir',
  templateUrl: './servicos-incluir.component.html',
  styleUrls: ['./servicos-incluir.component.css'],
  providers: [MessageService],
})
export class ServicosIncluirComponent {
  servicos: any[] = []; // Lista de serviços carregados
  novoServico: any = {}; // Objeto para criar/editar serviços
  selectedServico: any = null; // Serviço selecionado para edição
  cnpj: string | null = null;
  isLoading = false;

  constructor(
    private servicosService: ServicosService,
    private loginService: LoginService,
    private messageService: MessageService
  ) {}


  ngOnInit() {
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;  // Agora this.cnpj será apenas a string do CNPJ
    console.log("CNPJ do prestador logado:", this.cnpj);
  
    if (!this.cnpj) {
      console.warn("CNPJ não encontrado. O HTML pode estar oculto.");
    }
}


  async adicionarServico(): Promise<void> {
    console.log('CNPJ:', this.cnpj);  // Verificar o valor de this.cnpj
  
    if (!this.cnpj || this.cnpj.trim() === '') {
      this.showError('CNPJ não encontrado para a empresa logada.');
      console.error('Erro: this.cnpj está indefinido ou vazio.');
      return;
    }
  
    const servico = { 
      ...this.novoServico, 
      CNPJ: this.cnpj,
      VALOR: this.novoServico.VALOR_NUMERICO // Use VALOR_NUMERICO para o banco
    };
  
    this.isLoading = true;
  
    try {
      if (this.selectedServico) {
        await this.servicosService
          .updateServico(this.selectedServico.COD_SERVICO, servico)
          .toPromise();
        this.showSuccess('Serviço atualizado com sucesso!');
      } else {
        await this.servicosService.createServico(servico).toPromise();
        this.showSuccess('Serviço criado com sucesso!');
      }
      this.resetForm();
    } catch (error) {
      this.showError('Erro ao salvar o serviço. Tente novamente.');
      console.error('Erro:', error);
    } finally {
      this.isLoading = false;
    }
  }

  resetForm(): void {
    this.selectedServico = null;
    this.novoServico = {};
  }

  showSuccess(message: string): void {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }

  formatCurrency(event: any): void {
    const value = event.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    const numericValue = parseFloat(value) / 100; // Converte o valor para número (centavos para reais)
    
    // Para exibir o valor com "R$" e vírgula
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numericValue);
  
    // Atualiza o campo com o valor monetário formatado
    this.novoServico.VALOR = formattedValue;
  
    // Aqui, vamos armazenar apenas o valor numérico (sem símbolos) para o banco de dados
    this.novoServico.VALOR_NUMERICO = numericValue; // Armazena como número para enviar ao banco
  }

  formatItemLC(): void {
    if (this.novoServico.ITEM_LC) {
      // Remove qualquer caractere que não seja número
      let formattedItemLC = this.novoServico.ITEM_LC.replace(/\D/g, '');
      // Formata para ter 2 dígitos antes e 2 após o ponto
      formattedItemLC = formattedItemLC.substring(0, 2) + '.' + formattedItemLC.substring(2, 4);
      this.novoServico.ITEM_LC = formattedItemLC; // Atualiza o campo com o valor formatado
    }
  }
}
