import { Component } from '@angular/core';
import { PessoasService } from '../pessoas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pessoas-incluir',
  templateUrl: './pessoas-incluir.component.html',
  styleUrls: ['./pessoas-incluir.component.css'],
  providers: [MessageService],
})
export class PessoasIncluirComponent {
  mask: String = '';
  resultado: any;
  novaPessoa: any = {};

  constructor(
    private PessoasService: PessoasService,
    private messageService: MessageService
  ) {}

  // Exibe mensagem de sucesso
  showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: message,
    });
  }

  // Exibe mensagem de erro
  showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: message,
    });
  }

  // Método para criar uma pessoa
  createPessoa() {
    this.PessoasService.createPessoa(this.novaPessoa).subscribe(
      (data) => {
        this.resultado = data;
        this.novaPessoa = {}; // Limpa o formulário
        this.showSuccess('Usuário cadastrado com sucesso');
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        this.showError('Erro ao cadastrar usuário. Verifique os dados e tente novamente.');
      }
    );
  }

  // Método para buscar endereço pelo CEP
  buscarEnderecoPorCEP(cep: string) {

    this.PessoasService.getEnderecoPorCEP(cep).subscribe(
      (endereco) => {
        // Preenche os campos do formulário com os dados do endereço
        this.novaPessoa.RUA_LOGRADOURO = endereco.logradouro;
        this.novaPessoa.BAIRRO_LOGRADOURO = endereco.bairro;
        this.novaPessoa.CIDADE = endereco.cidade;
        this.novaPessoa.UF = endereco.uf;
        this.novaPessoa.COD_IBGE = endereco.cod_ibge;
      },
      (error) => {
        console.error('Erro ao buscar endereço:', error);
        // Limpa os campos de endereço
        this.novaPessoa.RUA_LOGRADOURO = '';
        this.novaPessoa.BAIRRO_LOGRADOURO = '';
        this.novaPessoa.CIDADE = '';
        this.novaPessoa.UF = '';
        this.novaPessoa.COD_IBGE = '';
        this.showError('Erro ao buscar endereço. Verifique o CEP informado.');
      }
    );
  }
}
