import { Component } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-incluir.component.html',
  styleUrls: ['./comandas-incluir.component.css']
})
export class ComandasIncluirComponent {
  novoCliente: string = ''; // Para criação de uma nova comanda
  cnpj: string | null = null; // CNPJ do prestador logado
  cpfCnpjInput: string = ''; // Para entrada de CPF/CNPJ
  nomeCliente: string = ''; // Para entrada do nome do cliente
  enderecoCliente: string = ''; // Para entrada do endereço
  displayDialogCPF: boolean = false; // Controle do diálogo para CPF/CNPJ
  displayDialogEndereco: boolean = false; // Controle do diálogo para nome e endereço

  // Propriedades faltantes
  CPF_CNPJ: string = ''; // Adicionada a propriedade CPF_CNPJ
  nome: string = ''; // Adicionada a propriedade nome

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService
  ) {}

  // Abre o diálogo para CPF/CNPJ
  openDialogCPF(isCpf: boolean) {
    if (isCpf) {
      this.displayDialogCPF = true; // Exibe o diálogo de CPF/CNPJ
    } else {
      this.displayDialogEndereco = true; // Exibe o diálogo de nome e endereço
    }
  }

  // Buscar cliente pelo CPF ou CNPJ
  buscarClientePorCPF() {
    if (!this.cpfCnpjInput.trim()) {
      console.warn('Informe o CPF ou CNPJ.');
      return;
    }

    // Aqui você pode implementar a lógica de buscar cliente no backend
    console.log('Buscando cliente com CPF/CNPJ:', this.cpfCnpjInput);
    // Após buscar, podemos preencher o nomeCliente com os dados do cliente
    // Exemplo: this.nomeCliente = dadosDoCliente.nome;

    this.displayDialogCPF = false; // Fecha o diálogo após buscar o cliente
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
    if (!this.nomeCliente.trim()) {
      console.warn('Informe o nome do cliente antes de criar a comanda.');
      return;
    }

    if (!this.cnpj) {
      console.warn('CNPJ não encontrado.');
      return;
    }

    const novaComanda = {
      CNPJ_PRESTADOR: this.cnpj,
      NOME_CLIENTE: this.nomeCliente,
      DATA_INICIAL: new Date(),
      DATA_FINAL: null,
      ITENS: []
    };

    this.comandasService.createComanda(novaComanda).subscribe({
      next: () => {
        console.log('Comanda criada com sucesso!');
        this.nomeCliente = ''; // Limpa o campo de entrada
      },
      error: (error) => {
        console.error('Erro ao criar comanda:', error);
      }
    });
  }

  // Método de busca de pessoas (substituir pelo método adequado)
  buscarpessoas() {
    console.log('Buscando pessoas...');
    // Aqui você pode implementar a lógica para realizar a busca
  }
}
