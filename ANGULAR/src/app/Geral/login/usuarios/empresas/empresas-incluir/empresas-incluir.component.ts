import { Component } from '@angular/core';
import { EmpresasService } from '../empresas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-empresas-incluir',
  templateUrl: './empresas-incluir.component.html',
  providers: [MessageService]
})
export class EmpresasIncluirComponent {
  
  mask: String = '';
  resultado: any;
  novaEmpresa: any = {};

  OPTANTE_SN = [
    { nome: 'OPTANTE', codigo: '1' },
    { nome: 'NÃO OPTANTE', codigo: '0' }
  ];

  constructor(
    private empresasService: EmpresasService,
    private messageService: MessageService
  ) {}

  adicionarEmpresa() {
    this.empresasService.adicionarEmpresa(this.novaEmpresa).subscribe(
      (data) => {
        this.resultado = data;
        this.novaEmpresa = {};
        this.showSuccess('Empresa cadastrada com sucesso');
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao cadastrar empresa');
        }
      }
    );
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('empresa já existe')) {
      this.showError('Erro: o empresa já existe.');
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

}