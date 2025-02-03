import { Component } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PessoasService } from '../../pessoas/pessoas.service';
import { Router } from '@angular/router';

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
  selector: 'app-comandas',
  templateUrl: './comandas-incluir.component.html',
  styleUrls: ['./comandas-incluir.component.css'],
  providers: [MessageService, ConfirmationService],
})
export class ComandasIncluirComponent {
  novoCliente: string = ''; // Para criação de uma nova comanda
  cnpj: string | null = null; // CNPJ do prestador logado
  cpfCnpjInput: string = ''; // Para entrada de CPF/CNPJ
  nomeCliente: string = ''; // Para entrada do nome do cliente
  enderecoCliente: string = ''; // Para entrada do endereço
  displayDialogCPF: boolean = false; // Controle do diálogo para CPF/CNPJ
  displayDialogEndereco: boolean = false; // Controle do diálogo para nome e endereço
  resultado: Pessoa | null = null; // Tipado como Pessoa
  pessoasEncontrados: Pessoa[] = []; // Lista de pessoas encontradas
  displayDialogUsuarios: boolean = false;
  displayDialogNovaPessoa: boolean = false; // Controla o diálogo de nova pessoa
  novaPessoa: any = {}; // Objeto para armazenar os dados da nova pessoa

  // Propriedades faltantes
  CPF_CNPJ: string = ''; // Adicionada a propriedade CPF_CNPJ
  nome: string = ''; // Adicionada a propriedade nome

  constructor(
    private router: Router,
    private comandasService: ComandasService,
    private loginService: LoginService, // Responsável pelo usuário logado
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private pessoasService: PessoasService
  ) {}


  ngOnInit() {
    this.cnpj = this.loginService.getEmpresaSelecionada() || null;
    console.log("CNPJ do prestador logado:", this.cnpj);
  
    // Se o CNPJ for indefinido, exiba um erro no console
    if (!this.cnpj) {
      console.warn("CNPJ não encontrado. O HTML pode estar oculto.");
    }
  }

  // Abre o diálogo para CPF/CNPJ
  openDialogCPF(isCpf: boolean) {
    if (isCpf) {
      this.displayDialogCPF = true; // Exibe o diálogo de CPF/CNPJ
    } else {
      this.displayDialogEndereco = true; // Exibe o diálogo de nome e endereço
    }
  }

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
        console.log("Dados retornados pela API:", data); // Depuração
  
        if (data) {
          this.pessoasEncontrados = Array.isArray(data) ? data : [data];
          this.displayDialogUsuarios = true;
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
          this.displayDialogUsuarios = true; // Agora o diálogo será aberto corretamente
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

  // Método para cancelar a busca
  cancelarBusca() {
    this.cpfCnpjInput = ''; // Limpa o campo de CPF/CNPJ
    this.displayDialogCPF = false; // Fecha o diálogo
    console.log('Busca cancelada.');
  }

  // Método para selecionar o cliente
  selecionarCliente() {
    if (!this.cpfCnpjInput.trim()) {
      console.warn('Por favor, informe o CPF/CNPJ antes de selecionar um cliente.');
      return;
    }

    // Aqui você pode adicionar a lógica para preencher os dados do cliente após seleção
    console.log('Cliente selecionado:', this.cpfCnpjInput);
    this.displayDialogCPF = false; // Fecha o diálogo após selecionar o cliente
    this.nomeCliente = 'Nome do Cliente'; // Exemplo de preenchimento após selecionar
  }

  // Salvar nome e endereço do cliente
  salvarEndereco() {
    if (!this.nomeCliente.trim() || !this.enderecoCliente.trim()) {
      console.warn('Informe o nome e o endereço do cliente.');
      return;
    }

    console.log('Nome e endereço do cliente:', this.nomeCliente, this.enderecoCliente);
    this.displayDialogEndereco = false; // Fecha o diálogo
  }

  // ✅ Criar uma nova comanda
  criarComanda() {
    // Certifique-se de que this.nomeCliente sempre tem um valor tratado corretamente
    this.nomeCliente = this.nomeCliente?.trim() || '';

    console.log("Nome do cliente antes de criar comanda:", this.nomeCliente);

    // ✅ Permite criar comanda apenas com o nome do cliente
    if (!this.nomeCliente && !this.CPF_CNPJ?.trim()) {
      this.showError('Informe pelo menos o nome do cliente ou um CPF/CNPJ antes de criar a comanda.');
      return;
    }

    if (!this.cnpj) {
      this.showError('CNPJ do prestador não encontrado. Verifique se está logado corretamente.');
      console.error('Erro: this.cnpj está indefinido.');
      return;
    }

    const novaComanda = {
      CNPJ_PRESTADOR: this.cnpj || "CNPJ NÃO DEFINIDO",
      NOME: this.nomeCliente || "Cliente Desconhecido",
      CPF_CNPJ_CLIENTE: this.CPF_CNPJ?.trim() || null, 
      EMAIL: this.novaPessoa?.EMAIL || null,
      DDD: this.novaPessoa?.DDD || null,
      TELEFONE_CELULAR: this.novaPessoa?.TELEFONE_CELULAR || null,
      ENDERECO: {
        CEP: this.novaPessoa?.CEP || null,
        RUA_LOGRADOURO: this.novaPessoa?.RUA_LOGRADOURO || null,
        NUMERO_LOGRADOURO: this.novaPessoa?.NUMERO_LOGRADOURO || null,
        BAIRRO_LOGRADOURO: this.novaPessoa?.BAIRRO_LOGRADOURO || null,
        COMPLEMENTO_LOGRADOURO: this.novaPessoa?.COMPLEMENTO_LOGRADOURO || null,
        CIDADE: this.novaPessoa?.CIDADE || null,
        UF: this.novaPessoa?.UF || null,
        COD_IBGE: this.novaPessoa?.COD_IBGE || null
      },
      DATA_INICIO: new Date(),
      DATA_FINAL: null,
      ITENS: []
    };

    console.log("Criando comanda com:", novaComanda);

    this.comandasService.createComanda(novaComanda).subscribe({
      next: (response) => {
        console.log('Comanda criada com sucesso!', response);
        this.showSuccess('Comanda criada com sucesso!');
        this.nomeCliente = ''; // Limpa o campo de entrada
        this.novaPessoa = {}; // Limpa os dados temporários

        setTimeout(() => {
          this.router.navigate(['dashboard/comandas/consultar']);
        }, 2000);
      },
      error: (error) => {
        console.error('Erro ao criar comanda:', error);
        this.showError('Erro ao criar comanda. Verifique os dados e tente novamente.');
      }
    });
}

  showSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: message });
  }

  showError(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }

  selecionarpessoas(pessoa: Pessoa) {
    this.resultado = pessoa; 
    this.nomeCliente = pessoa.NOME; // ✅ Agora armazena o nome do cliente
    this.displayDialogUsuarios = false; // ✅ Fecha o diálogo após seleção
    console.log("Cliente selecionado:", this.nomeCliente); // ✅ Debug para verificar
  }
  

  openDialogNovaPessoa() {
    this.novaPessoa = {}; // Reseta os dados sempre que abrir o diálogo
    this.displayDialogNovaPessoa = true; // Abre o diálogo
  }
  
  createPessoa() {
    console.log("Criando nova pessoa:", this.novaPessoa);
    // Aqui você pode chamar um serviço para salvar os dados no backend
    this.displayDialogNovaPessoa = false; // Fecha o diálogo após salvar
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

}
