import { Component } from '@angular/core';

@Component({
  selector: 'app-gerar-nfse',
  templateUrl: './gerar-nfse.component.html',
  styleUrls: ['./gerar-nfse.component.css']
})
export class GerarNfseComponent {
  nfseData = {
    numero: '',
    serie: '',
    tipo: '',
    dataEmissao: '',
    status: '',
    competencia: '',
    valorServicos: '',
    valorDeducoes: '',
    valorPis: '',
    valorCofins: '',
    valorInss: '',
    tomadorCpfCnpj: '',
    tomadorRazaoSocial: '',
    tomadorEndereco: '',
    tomadorCep: '',
    tomadorEmail: ''
  };

  isEnvioSucesso: boolean = false;
  exibirMensagem: boolean = false;
  mensagem: string = '';

  onSubmit() {
    console.log('Dados enviados:', this.nfseData);

    // Simular envio ao backend
    this.isEnvioSucesso = this.enviarDadosParaBackend(this.nfseData);
    this.exibirMensagem = true;
    this.mensagem = this.isEnvioSucesso
      ? 'Nota fiscal enviada com sucesso!'
      : 'Erro ao enviar a nota fiscal.';
  }

  enviarDadosParaBackend(dados: any): boolean {
    // TODO: Implementar envio ao backend
    console.log('Enviando dados ao backend:', dados);
    return true; // Simulação de sucesso
  }
}
