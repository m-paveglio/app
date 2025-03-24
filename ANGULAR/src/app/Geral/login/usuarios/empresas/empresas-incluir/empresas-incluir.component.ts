import { Component } from '@angular/core';
import { EmpresasService } from '../empresas.service';
import { MessageService } from 'primeng/api';
import { cnpj } from 'cpf-cnpj-validator';

@Component({
  selector: 'app-empresas-incluir',
  templateUrl: './empresas-incluir.component.html',
  styleUrls: ['./empresas-incluir.component.css'],
  providers: [MessageService]
})
export class EmpresasIncluirComponent {
  
  mask: String = '';
  resultado: any;
  novaEmpresa: any = {};
  certificadoSelecionado: File | null = null;
  uploadedFiles: File[] = [];
  senhaCertificado: string = '';
  cnpjEmpresa: string = '';


  OPTANTE_SN = [
    { nome: 'OPTANTE', codigo: '1' },
    { nome: 'NÃO OPTANTE', codigo: '0' }
  ];

  AMBIENTE_INTEGRACAO = [
    { nome: 'PRODUÇÃO', codigo: '1' },
    { nome: 'HOMOLOGAÇÃO', codigo: '2' }
  ];

  constructor(
    private empresasService: EmpresasService,
    private messageService: MessageService
  ) {}


  onCertificadoSelecionado(event: any): void {
    if (event.files && event.files.length > 0) {
      this.certificadoSelecionado = event.files[0];
      this.messageService.add({
        severity: 'info',
        summary: 'Certificado selecionado',
        detail: this.certificadoSelecionado?.name || 'Arquivo sem nome'
      });
    }
  }

  enviarCertificado(): void {
    // Validações
    if (!this.cnpjEmpresa) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'CNPJ não informado'
      });
      return;
    }

    if (!this.certificadoSelecionado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Selecione um certificado primeiro'
      });
      return;
    }

    if (!this.senhaCertificado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Informe a senha do certificado'
      });
      return;
    }

    // Envio do certificado
    this.empresasService.enviarCertificado(
      this.cnpjEmpresa,
      this.certificadoSelecionado,
      this.senhaCertificado
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Certificado enviado com sucesso'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Falha ao enviar certificado: ' + (err.error?.message || err.message)
        });
      }
    });
  }

  isCnpjValido(cnpjStr: string): boolean {
    try {
      const cnpjLimpo = cnpjStr.replace(/\D/g, '');
      if (cnpjLimpo.length !== 14) return false;
      return cnpj.isValid(cnpjLimpo);
    } catch {
      return false;
    }
  }

  async adicionarEmpresa() {
    // Validação do CNPJ
    if (!this.novaEmpresa.CNPJ || !this.isCnpjValido(this.novaEmpresa.CNPJ)) {
      this.showError('CNPJ inválido!');
      return;
    }

    try {
      // 1. Primeiro cria a empresa
      const empresaCriada = await this.empresasService.adicionarEmpresa(this.novaEmpresa).toPromise();

      // 2. Se tem certificado, faz upload
      if (this.certificadoSelecionado && this.senhaCertificado) {
        const arrayBuffer = await this.readFileAsArrayBuffer(this.certificadoSelecionado);
        const buffer = new Uint8Array(arrayBuffer);
        
        await this.empresasService.uploadCertificado(
          this.novaEmpresa.CNPJ,
          buffer,
          this.senhaCertificado
        ).toPromise();
      }

      this.showSuccess('Empresa cadastrada com sucesso!');

      // Limpa o formulário
      this.novaEmpresa = {};
      this.certificadoSelecionado = null;
      this.senhaCertificado = '';

    } catch (error: unknown) {
      let errorMessage = 'Erro desconhecido';
    
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'error' in error) {
        const errObj = error as { error?: { message?: string } };
        if (errObj.error?.message) {
          this.processarErro(errObj.error.message);
          return;
        }
      }
    
      this.showError('Falha ao cadastrar empresa: ' + errorMessage);
    }
  }

  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('empresa já existe')) {
      this.showError('Erro: a empresa já existe.');
    } else if (mensagemErro.includes('campos obrigatórios')) {
      this.showError('Erro: preencha todos os campos obrigatórios.');
    } else {
      this.showError('Erro ao cadastrar empresa: ' + mensagemErro);
    }
  }

  showSuccess(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem });
  }

  showError(mensagem: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem });
  }
}