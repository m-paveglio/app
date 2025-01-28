import { Component } from '@angular/core';
import { PessoasService } from '../pessoas.service';

@Component({
  selector: 'app-pessoas-incluir',
  templateUrl: './pessoas-incluir.component.html',
  styleUrls: ['./pessoas-incluir.component.css'],
})
export class PessoasIncluirComponent {
  mask: String = '';
  resultado: any;
  novaPessoa: any = {};
  mensagem: any;
  exibirMensagem: boolean = false;

  constructor(private PessoasService: PessoasService) {}

  // Método para criar uma pessoa
  createPessoa() {
    this.PessoasService.createPessoa(this.novaPessoa).subscribe(
      (data) => {
        this.resultado = data;
        this.novaPessoa = {};
        this.mensagem = 'Usuário cadastrado com sucesso';
        this.exibirMensagem = true;
        setTimeout(() => {
          this.exibirMensagem = false;
        }, 3000);
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        this.mensagem = 'Erro ao cadastrar usuário';
        this.exibirMensagem = true;
        setTimeout(() => {
          this.exibirMensagem = false;
        }, 3000);
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
      },
      (error) => {
        console.error('Erro ao buscar endereço:', error);
        // Limpa os campos de endereço se ocorrer erro
        this.novaPessoa.RUA_LOGRADOURO = '';
        this.novaPessoa.BAIRRO_LOGRADOURO = '';
        this.novaPessoa.CIDADE = '';
        this.novaPessoa.UF = '';
        this.mensagem = 'Erro ao buscar endereço. Verifique o CEP informado.';
        this.exibirMensagem = true;
        setTimeout(() => {
          this.exibirMensagem = false;
        }, 3000);
      }
    );
  }
}
