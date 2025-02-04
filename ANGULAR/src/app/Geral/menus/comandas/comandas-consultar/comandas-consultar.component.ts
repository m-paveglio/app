import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-consultar.component.html',
  styleUrls: ['./comandas-consultar.component.css']
})
export class ComandasConsultarComponent implements OnInit {
  comandasEmAberto: any[] = []; // Lista de comandas em aberto
  cnpj: string | null = null; // CNPJ do prestador logado

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;
    console.log('CNPJ logado:', this.cnpj);

    if (this.cnpj) {
      this.carregarComandasEmAberto();
    }
  }

  carregarComandasEmAberto() {
    if (this.cnpj) {
      this.comandasService.getComandasAbertas(this.cnpj).subscribe({
        next: (response) => {
          console.log('Resposta da API:', response); // Debug para ver os dados recebidos
  
          // Verifica se a resposta já é um array ou precisa acessar `data`
          const dadosRecebidos = Array.isArray(response) ? response : response.data;
  
          if (Array.isArray(dadosRecebidos)) {
            this.comandasEmAberto = dadosRecebidos.map((comanda: any) => ({
              ...comanda,
              CPF_CNPJ: comanda.CPF_CNPJ || {} // Evita erro caso CPF_CNPJ seja null
            }));
          } else {
            console.error('Formato inesperado da API:', response);
            this.comandasEmAberto = [];
          }
  
          console.log('Comandas processadas:', this.comandasEmAberto);
        },
        error: (error) => {
          console.error('Erro ao carregar comandas:', error);
          this.comandasEmAberto = [];
        }
      });
    }
  }
  
}  