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
  
  dialogVisivel: boolean = false;
  selectedComanda: any = null;

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
              CPF_CNPJ: comanda.CPF_CNPJ || {},
              SERVICOS: comanda.SERVICOS || [] // Garante que sempre tenha um array de serviços
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

  abrirDialog(comanda: any) {
    this.selectedComanda = comanda;
    this.dialogVisivel = true;
  }

  abrirDialogAdicionarServico() {
    console.log("Abrir diálogo para adicionar serviço");
    // Aqui você pode abrir outro diálogo para adicionar serviços na comanda
  }
}
