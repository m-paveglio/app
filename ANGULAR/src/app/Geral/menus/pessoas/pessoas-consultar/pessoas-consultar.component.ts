import { Component } from '@angular/core';
import { PessoasService } from '../pessoas.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Interface para tipar os dados da pessoa
interface Pessoa {
  CPF: string;
  CPF_CNPJ: string; // Adicionado
  NOME: string;
  EMAIL?: string;
  TIPO_USER?: string;
  DDD?: string; // Adicionado
  TELEFONE_CELULAR?: string; // Adicionado
  CEP?: string;
  RUA_LOGRADOURO?: string;
  NUMERO_LOGRADOURO?: string;
  BAIRRO_LOGRADOURO?: string;
  COMPLEMENTO_LOGRADOURO?: string;
  CIDADE?: string;
  COD_IBGE?: string;
  UF?: string;
}

@Component({
  selector: 'app-pessoas-consultar',
  templateUrl: './pessoas-consultar.component.html',
  styleUrls: ['./pessoas-consultar.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class PessoasConsultarComponent {
  CPF_CNPJ: string = '';
  nome: string = '';
  resultado: Pessoa | null = null; // Tipado como Pessoa
  pessoasEncontrados: Pessoa[] = []; // Lista de pessoas encontradas
  editMode = false;
  novaPessoa: any = {};

  constructor(
    private pessoasService: PessoasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // Validação de CPF
  isCpfValido(CPF_CNPJ: string): boolean {
    if (!CPF_CNPJ || CPF_CNPJ.length !== 11) return false;
    let soma = 0,
      resto;
    if (CPF_CNPJ === '00000000000') return false;
    for (let i = 1; i <= 9; i++) soma += parseInt(CPF_CNPJ.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(CPF_CNPJ.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(CPF_CNPJ.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(CPF_CNPJ.substring(10, 11));
  }

  buscarpessoas() {
    if (this.CPF_CNPJ) {
      // Busca por CPF
      this.buscarPorCpf();
    } else if (this.nome) {
      // Busca por Nome
      this.buscarPorNome();
    } else {
      this.showError('Informe um CPF ou Nome para realizar a busca.');
    }
  }
  
  buscarPorCpf() {
    this.pessoasService.buscarPorCpf(this.CPF_CNPJ).subscribe(
      (data) => {
        if (data) {
          this.resultado = data; // Exibe os detalhes da pessoa
          this.pessoasEncontrados = []; // Limpa a tabela
        } else {
          this.showError('Nenhuma pessoa encontrada com este CPF.');
        }
      },
      (error) => {
        console.error('Erro ao buscar por CPF:', error);
        this.showError('Erro ao buscar pessoa. Tente novamente.');
      }
    );
  }
  
  buscarPorNome() {
    this.pessoasService.buscarPorNome(this.nome).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.pessoasEncontrados = data; // Exibe a tabela com resultados
          this.resultado = null; // Limpa os detalhes
        } else {
          this.showError('Nenhuma pessoa encontrada com este nome.');
        }
      },
      (error) => {
        console.error('Erro ao buscar por Nome:', error);
        this.showError('Erro ao buscar pessoa. Tente novamente.');
      }
    );
  }
  
  selecionarpessoas(pessoa: Pessoa) {
    this.resultado = pessoa; // Define a pessoa selecionada como resultado
    this.pessoasEncontrados = []; // Limpa a lista de pessoas
  }

  salvarpessoas() {
    if (this.resultado) {
      this.pessoasService.atualizarpessoas(this.resultado.CPF, this.resultado).subscribe(
        () => {
          this.editMode = false;
          this.showSuccess('Dados atualizados com sucesso!');
        },
        (error) => {
          console.error('Erro ao atualizar pessoa:', error);
          this.showError('Erro ao atualizar os dados. Tente novamente.');
        }
      );
    }
  }

  confirmarExclusao() {
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta pessoa?',
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (this.resultado) {
          this.excluirpessoas(this.resultado.CPF);
        }
      },
    });
  }

  excluirpessoas(cpf: string) {
    this.pessoasService.deletePessoa(cpf).subscribe(
      () => {
        this.resultado = null;
        this.showSuccess('Pessoa excluída com sucesso!');
      },
      (error) => {
        console.error('Erro ao excluir pessoa:', error);
        this.showError('Erro ao excluir a pessoa.');
      }
    );
  }

  buscarEnderecoPorCEP(cep: string) {

    this.pessoasService.getEnderecoPorCEP(cep).subscribe(
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

  editarPessoas(CPF_CNPJ: string) {
    this.pessoasService.buscarPorCpf(CPF_CNPJ).subscribe(
      (data) => {
        this.resultado = data;
        this.editMode = true;
      },
      (error) => {
        console.error('Erro ao excluir pessoa:', error);
        this.showError('Erro ao excluir a pessoa.');
      }
    );
  }

  cancelarEdicao() {
    this.editMode = false;
    // Adicione qualquer lógica necessária para restaurar os dados originais
}

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
}
