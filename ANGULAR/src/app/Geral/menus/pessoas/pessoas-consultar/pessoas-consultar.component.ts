import { Component } from '@angular/core';
import { PessoasService } from '../pessoas.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Interface para tipar os dados da pessoa
interface Pessoa {
  CPF: string;
  IM: string;
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

  resultados: Pessoa = {
    CPF: '',
    CPF_CNPJ: '',
    IM: '',
    NOME: '',
    EMAIL: '',
    TIPO_USER: '',
    DDD: '',
    TELEFONE_CELULAR: '',
    CEP: '',
    RUA_LOGRADOURO: '',
    NUMERO_LOGRADOURO: '',
    BAIRRO_LOGRADOURO: '',
    COMPLEMENTO_LOGRADOURO: '',
    CIDADE: '',
    COD_IBGE: '',
    UF: ''
  };

  constructor(
    private pessoasService: PessoasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  isCpfValido(CPF_CNPJ: string): boolean {
    if (!CPF_CNPJ || CPF_CNPJ.length !== 11) return false;
    let soma = 0, resto;
    if (/^(\d)\1+$/.test(CPF_CNPJ)) return false; // Evita CPFs com números repetidos (ex: 00000000000)
    for (let i = 1; i <= 9; i++) soma += parseInt(CPF_CNPJ[i - 1]) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(CPF_CNPJ[9])) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(CPF_CNPJ[i - 1]) * (12 - i);
    resto = (soma * 10) % 11;
    return resto === parseInt(CPF_CNPJ[10]);
  }

  /** Valida se um CNPJ é válido */
  isCnpjValido(CNPJ: string): boolean {
    if (!CNPJ || CNPJ.length !== 14) return false;
    if (/^(\d)\1+$/.test(CNPJ)) return false; // Evita CNPJs com números repetidos

    let tamanho = CNPJ.length - 2;
    let numeros = CNPJ.substring(0, tamanho);
    let digitos = CNPJ.substring(tamanho);
    let soma = 0, pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos[0])) return false;
    
    tamanho++;
    numeros = CNPJ.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros[tamanho - i]) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos[1]);
  }

  /** Determina se um CPF ou CNPJ é válido */
  isCpfCnpjValido(CPF_CNPJ: string): boolean {
    if (CPF_CNPJ.length === 11) return this.isCpfValido(CPF_CNPJ);
    if (CPF_CNPJ.length === 14) return this.isCnpjValido(CPF_CNPJ);
    return false;
  }

  buscarpessoas() {
    if (!this.CPF_CNPJ && !this.nome) {
      this.showError('Informe um CPF, CNPJ ou Nome para realizar a busca.');
      return;
    }

    if (this.CPF_CNPJ) {
      if (!this.isCpfCnpjValido(this.CPF_CNPJ)) {
        this.showError('CPF ou CNPJ inválido.');
        return;
      }
      this.buscarPorCpf();
    } else {
      this.buscarPorNome();
    }
  }

  buscarPorCpf() {
    this.pessoasService.buscarPorCpf(this.CPF_CNPJ).subscribe(
      (data) => {
        if (data) {
          this.resultado = data;
          this.pessoasEncontrados = [];
        } else {
          this.showError('Nenhuma pessoa encontrada com este CPF/CNPJ.');
        }
      },
      (error) => {
        console.error('Erro ao buscar por CPF/CNPJ:', error);
        this.showError('Erro ao buscar pessoa. Tente novamente.');
      }
    );
  }

  buscarPorNome() {
    this.pessoasService.buscarPorNome(this.nome).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.pessoasEncontrados = data;
          this.resultado = null;
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

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }
  
  selecionarpessoas(pessoa: Pessoa) {
    this.resultado = pessoa; // Define a pessoa selecionada como resultado
    this.pessoasEncontrados = []; // Limpa a lista de pessoas
  }

  salvarpessoas() {
    if (this.resultado) {
      this.pessoasService.atualizarpessoas(this.resultado.CPF_CNPJ, this.resultado).subscribe(
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
    if (!cep || !this.editMode) return; // 🔹 Bloqueia a busca se não estiver no modo edição

    if (!this.isCepValido(cep)) {
        this.showError('CEP inválido! O CEP deve ter 8 dígitos numéricos.');
        return;
    }

    // Garante que resultado não seja null
    if (!this.resultado) {
        this.resultado = {} as Pessoa;
    }

    // Limpa todos os campos antes da busca
    Object.assign(this.resultado, {
        RUA_LOGRADOURO: '',
        BAIRRO_LOGRADOURO: '',
        CIDADE: '',
        UF: '',
        COD_IBGE: '',
        COMPLEMENTO_LOGRADOURO: '',
        NUMERO_LOGRADOURO: ''
    });

    this.pessoasService.getEnderecoPorCEP(cep).subscribe(
      (endereco) => {
        if (this.resultado) {
          this.resultado.RUA_LOGRADOURO = endereco.logradouro || '';
          this.resultado.BAIRRO_LOGRADOURO = endereco.bairro || '';
          this.resultado.CIDADE = endereco.cidade || '';
          this.resultado.UF = endereco.uf || '';
          this.resultado.COD_IBGE = endereco.cod_ibge || '';
          this.resultado.COMPLEMENTO_LOGRADOURO = endereco.complemento || '';
          this.resultado.NUMERO_LOGRADOURO = endereco.numero || '';
        }
      },
      (error) => {
        console.error('Erro ao buscar endereço:', error);
        this.showError('Erro ao buscar endereço. Verifique o CEP informado.');
      }
    );
}

/** Valida se o CEP é válido */
isCepValido(cep: string): boolean {
    return /^\d{8}$/.test(cep.replace(/\D/g, '')); // Permite apenas números e exige 8 dígitos
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

}
