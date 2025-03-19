import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';
import { ServicosService } from '../../servicos/servicos.service';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-consultar.component.html',
  styleUrls: ['./comandas-consultar.component.css']
})
export class ComandasConsultarComponent implements OnInit {
  comandasEmAberto: any[] = [];
  cnpj: string | null = null;
  selectedComanda: any = null;
  isLoading = false;
  servicos: any[] = [];

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService,
    private servicosService: ServicosService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;

    if (this.cnpj) { 
      this.carregarComandasEmAberto();
      this.loadServicos();
    }

     // Força a recarga do componente quando a rota muda
      this.router.onSameUrlNavigation = 'reload';
      this.route.params.subscribe(params => {
        if (params['COD_COMANDA']) {
          this.carregarComanda(params['COD_COMANDA']);
        } else {
          this.selectedComanda = null; // Limpa a comanda selecionada se não houver parâmetro
        }
      });
    }

  carregarComanda(COD_COMANDA: string) {
    if (!this.cnpj) return;

    this.comandasService.getComanda(this.cnpj, COD_COMANDA).subscribe({
      next: (response) => {
        this.selectedComanda = response.data || null;
      },
      error: () => {
        this.selectedComanda = null;
        this.showError('Erro ao carregar a comanda selecionada.');
      }
    });
  }

  carregarComandasEmAberto() {
    if (this.cnpj) {
      this.comandasService.getComandasAbertas(this.cnpj).subscribe({
        next: (response) => {
          const dadosRecebidos = Array.isArray(response) ? response : response.data;

          if (Array.isArray(dadosRecebidos)) {
            this.comandasEmAberto = dadosRecebidos.map((comanda: any) => ({
              ...comanda,
              CPF_CNPJ: comanda.CPF_CNPJ || {},
              SERVICOS: comanda.SERVICOS || []
            }));
          } else {
            console.error('Formato inesperado da API:', response);
            this.comandasEmAberto = [];
          }
        },
        error: (error) => {
          console.error('Erro ao carregar comandas:', error);
          this.comandasEmAberto = [];
        }
      });
    }
  }

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }

  async loadServicos(): Promise<void> {
    if (!this.cnpj) return;

    this.isLoading = true;
    try {
      const resposta = await this.servicosService.getServicos(this.cnpj).toPromise();
      this.servicos = (Array.isArray(resposta) ? resposta : resposta?.data || []).map((servico) => ({
        ...servico,
        codServico: servico.COD_SERVICO,
        isEditing: false,
      }));
    } catch (error) {
      this.showError('Erro ao carregar os serviços. Tente novamente.');
    } finally {
      this.isLoading = false;
    }
  }

  abrirComanda(comanda: any) {
    this.selectedComanda = comanda;
  }
  
  voltar() {
    this.selectedComanda = null;
  }
}