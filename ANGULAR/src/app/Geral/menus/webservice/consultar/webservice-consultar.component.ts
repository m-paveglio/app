import { Component, OnInit } from '@angular/core';
import { WebserviceService } from '../webservice.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-webservice-consultar',
  templateUrl: './webservice-consultar.component.html',
  styleUrls: ['./webservice-consultar.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class WebserviceConsultarComponent implements OnInit {
  webservices: any[] = [];
  isLoading = false;
  

  constructor(
    private webserviceService: WebserviceService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadWebservice();
  }

  async loadWebservice(): Promise<void> {
    this.isLoading = true;
    try {
      const resposta = await this.webserviceService.getWebservices().toPromise();
      
      // Verifica se a resposta é um array válido
      if (!Array.isArray(resposta)) {
        throw new Error('Resposta da API inválida.');
      }
  
      this.webservices = resposta.map((webservice) => ({
        ...webservice,
        ID: webservice.ID,  // Renomeia ID para codServico
      }));
  
    } catch (error) {
      this.showError('Erro ao carregar os webservices.');
      console.error('Erro ao carregar:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async saveWebservice(webservice: any): Promise<void> {
    if (!webservice || !webservice.ID) {
      this.showError('Erro: Webservice inválido.');
      return;
    }
  
    try {
      // Cria um novo objeto sem as propriedades de controle da interface
      const dadosParaEnviar = {
        ID: webservice.ID,
        NOME_CIDADE: webservice.NOME_CIDADE,
        LINK: webservice.LINK,
        SERIE_RPS: webservice.SERIE_RPS
      };
  
      await this.webserviceService.updateWebservice(webservice.ID, dadosParaEnviar).toPromise();
      
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Webservice atualizado com sucesso!',
      });
      
      webservice.isEditing = false;
      this.loadWebservice(); // Recarrega os dados para garantir sincronização
      
    } catch (error) {
      this.showError('Erro ao salvar o webservice. Tente novamente.');
      console.error('Erro detalhado:', error);
    }
  }

  confirmarExclusaoWebservice(webservice: any) {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o webservice "${webservice.NOME_CIDADE}"?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.excluirWebservice(webservice.ID);
      },
    });
  }

  async excluirWebservice(ID: number): Promise<void> {
    try {
      await this.webserviceService.deleteWebservice(ID).toPromise();
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Webservice excluído com sucesso!',
      });
      this.webservices = this.webservices.filter((ws) => ws.ID !== ID);
    } catch (error) {
      this.showError('Erro ao excluir o webservice. Tente novamente.');
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
}
