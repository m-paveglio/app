import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-consultar.component.html',
  styleUrls: ['./comandas-consultar.component.css']
})
export class ComandasConsultarComponent implements OnInit {
  comandasEmAberto: any[] = []; // Armazena as comandas em aberto
  novoCliente: string = ''; // Para criação de uma nova comanda
  cnpj: string | null = null; // CNPJ do prestador logado

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    this.cnpj = this.loginService.getEmpresaSelecionada()?.CNPJ;
    console.log('CNPJ logado:', this.cnpj); // Debugging
    if (this.cnpj) {
      this.carregarComandasEmAberto();
    }
  }

  // ✅ Carregar todas as comandas em aberto
  carregarComandasEmAberto() {
    if (this.cnpj) {
      this.comandasService.getComandasAbertas(this.cnpj).subscribe({
        next: (response) => {
          this.comandasEmAberto = response.data; // Ajuste dependendo da estrutura do retorno
        },
        error: (error) => {
          console.error('Erro ao carregar comandas em aberto:', error);
        }
      });
    }
  }

  // ✅ Criar uma nova comanda
  criarComanda() {
    if (!this.novoCliente.trim()) {
      console.warn('Informe o nome do cliente antes de criar a comanda.');
      return;
    }

    if (!this.cnpj) {
      console.warn('CNPJ não encontrado.');
      return;
    }

    const novaComanda = {
      CNPJ_PRESTADOR: this.cnpj,
      NOME_CLIENTE: this.novoCliente,
      DATA_INICIAL: new Date(),
      DATA_FINAL: null,
      ITENS: []
    };

    this.comandasService.createComanda(novaComanda).subscribe({
      next: () => {
        console.log('Comanda criada com sucesso!');
        this.novoCliente = ''; // Limpa o campo de entrada
        this.carregarComandasEmAberto(); // Atualiza a lista de comandas abertas
      },
      error: (error) => {
        console.error('Erro ao criar comanda:', error);
      }
    });
  }
}
