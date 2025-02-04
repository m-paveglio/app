import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-consultar.component.html',
  styleUrls: ['./comandas-consultar.component.css']
})
export class ComandasConsultarComponent implements OnInit {
  comandasEmAberto: any[] = [];
  responsiveOptions: any[] = [];
  cnpj: string | null = null;

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService
  ) {}

  ngOnInit() {
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;
  
    if (this.cnpj) {
      this.carregarComandasEmAberto();
    }
  
    // Configuração para tornar o carrossel responsivo
    this.responsiveOptions = [
      {
        breakpoint: '1400px',
        numVisible: 8,
        numScroll: 2
      },
      {
        breakpoint: '1200px',
        numVisible: 6,
        numScroll: 2
      },
      {
        breakpoint: '992px',
        numVisible: 4,
        numScroll: 2
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }
  

  carregarComandasEmAberto() {
    if (this.cnpj) {
      this.comandasService.getComandasAbertas(this.cnpj).subscribe({
        next: (response) => {
          console.log('Resposta da API:', response);
  
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