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
    valorServicos: ''
    // Adicione os demais campos conforme necessário
  };

  isEnvioSucesso: boolean = false;
  exibirMensagem: boolean = false;
  mensagem: string = '';

  onSubmit() {
    console.log(this.nfseData);
    // Lógica de envio do XML para o backend
    this.isEnvioSucesso = true; // Atualize conforme a resposta do backend
    this.exibirMensagem = true;
    this.mensagem = this.isEnvioSucesso ? 'Nota fiscal enviada com sucesso!' : 'Erro ao enviar a nota fiscal.';
  }
}
