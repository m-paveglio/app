import { Component, OnInit } from '@angular/core';
import { ComandasService } from '../comandas.service';
import { LoginService } from '../../../login/login.service';
import { ServicosService } from '../../servicos/servicos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-comandas',
  templateUrl: './comandas-consultar.component.html',
  styleUrls: ['./comandas-consultar.component.css'],
    providers: [MessageService, ConfirmationService]
})
export class ComandasConsultarComponent implements OnInit {
  comandasEmAberto: any[] = [];
  cnpj: string | null = null;
  selectedComanda: any = null;
  isLoading = false;
  servicos: any[] = [];
  servicoSelecionado: any = null;
  quantidade: number = 1;
  comandaParaExcluir: any = null;
  indiceParaExcluir: number | null = null;

  constructor(
    private comandasService: ComandasService,
    private loginService: LoginService,
    private servicosService: ServicosService,
    private confirmationService: ConfirmationService, // Adicione aqui
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Força a recarga do componente quando a rota muda
    this.router.onSameUrlNavigation = 'reload';
  
    // Obter o CNPJ da empresa logada
    const empresa = this.loginService.getEmpresaSelecionada();
    this.cnpj = empresa?.CNPJ || null;
  
    // Verificar se o CNPJ está disponível antes de tentar carregar as comandas
    if (this.cnpj) {
      this.carregarComandasEmAberto();
      this.loadServicos();
    }
  
    // Inscrever-se para os parâmetros da rota para carregar a comanda com base no COD_COMANDA
    this.route.params.subscribe(params => {
      const cnpj = params['CNPJ'];
      const codComanda = params['COD_COMANDA'];
  
      if (cnpj && codComanda) {
        this.cnpj = cnpj;  // Atualiza o CNPJ no componente
        this.carregarComanda(codComanda);  // Carregar a comanda com base no COD_COMANDA
      } else {
        this.selectedComanda = null;  // Limpa a comanda se não houver CNPJ ou COD_COMANDA
      }
    });
  }

  carregarComanda(COD_COMANDA: string) {
    if (!this.cnpj || !COD_COMANDA) {
      console.error('CNPJ ou COD_COMANDA não fornecidos.');
      this.showError('Dados insuficientes para carregar a comanda.');
      return;
    }
  
    this.isLoading = true;
  
    this.comandasService.getComanda(this.cnpj, COD_COMANDA).subscribe({
      next: (response) => {
        if (response) {
          this.selectedComanda = response;
          this.selectedComanda.SERVICOS = this.selectedComanda.SERVICOS || []; // ✅ Garante que sempre seja um array
  
          // ✅ Agora carregamos os serviços vinculados diretamente
          this.carregarServicosDaComanda(this.selectedComanda.CPF_CNPJ, this.selectedComanda.COD_COMANDA);
  
          console.log('Comanda carregada com sucesso:', this.selectedComanda);
        } else {
          console.error('Comanda não encontrada ou dados inválidos:', response);
          this.showError('Comanda não encontrada.');
          this.selectedComanda = null;
        }
      },
      error: (error) => {
        console.error('Erro ao carregar a comanda:', error);
        this.showError('Erro ao carregar a comanda. Tente novamente.');
        this.selectedComanda = null;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  carregarComandaComServicos(COD_COMANDA: string) {
    if (!this.cnpj) return;
  
    // Carregar a comanda
    this.comandasService.getComanda(this.cnpj, COD_COMANDA).subscribe({
      next: (response) => {
        this.selectedComanda = response.data || null;
  
        // Se a comanda foi carregada, carregar os serviços vinculados
        if (this.selectedComanda) {
          this.carregarServicosDaComanda(this.selectedComanda.CPF_CNPJ, this.selectedComanda.COD_COMANDA);
        }
      },
      error: () => {
        this.selectedComanda = null;
        this.showError('Erro ao carregar a comanda selecionada.');
      }
    });
  }
  
  carregarServicosDaComanda(CPF_CNPJ: string, COD_COMANDA: string) {
    if (!CPF_CNPJ || !COD_COMANDA) {
      console.error('CPF_CNPJ ou COD_COMANDA não fornecidos.');
      return;
    }
  
    this.comandasService.getComandaXservico(CPF_CNPJ, COD_COMANDA).subscribe({
      next: (response) => {
        if (response) {
          this.selectedComanda.SERVICOS = Array.isArray(response) ? response : [response];
  
          // ✅ Força a atualização na UI
          this.selectedComanda = Object.assign({}, this.selectedComanda);
        } else {
          console.error('Formato de serviços inválido:', response);
          this.selectedComanda.SERVICOS = [];
        }
      },
      error: (error) => {
        console.error('Erro ao carregar serviços:', error);
        this.selectedComanda.SERVICOS = [];
        this.showError('Erro ao carregar os serviços vinculados à comanda.');
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

  async loadServicos(): Promise<void> {
    // Verifica se o CNPJ está disponível
    if (!this.cnpj) {
      console.error('CNPJ não fornecido.');
      this.showError('CNPJ da empresa não encontrado.');
      return;
    }
  
    // Ativa o indicador de carregamento
    this.isLoading = true;
  
    try {
      // Faz a requisição para carregar os serviços
      const resposta = await this.servicosService.getServicos(this.cnpj).toPromise();
  
      // Verifica se a resposta contém dados válidos
      if (resposta && Array.isArray(resposta)) {
        // Mapeia os serviços para o formato esperado pelo dropdown
        this.servicos = resposta.map((servico) => ({
          COD_SERVICO: servico.COD_SERVICO,
          DESC_SERVICO: servico.DESC_SERVICO,
          VALOR: servico.VALOR
        }));
  
        console.log('Serviços carregados com sucesso:', this.servicos);
      } else {
        console.error('Formato de serviços inválido:', resposta);
        this.servicos = [];
        this.showError('Nenhum serviço encontrado.');
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      this.showError('Erro ao carregar os serviços. Tente novamente.');
      this.servicos = [];
    } finally {
      // Desativa o indicador de carregamento
      this.isLoading = false;
    }
  }

  adicionarServico() {
    if (!this.selectedComanda || !this.servicoSelecionado) {
      this.showError('Selecione um serviço para adicionar.');
      return;
    }
  
    const novoServico = {
      COD_COMANDA: this.selectedComanda.COD_COMANDA,
      COD_SERVICO: this.servicoSelecionado.COD_SERVICO,
      CNPJ_PRESTADOR: this.cnpj,
      VALOR: this.servicoSelecionado.VALOR,
      QUANTIDADE: this.quantidade || 1,
      VALOR_FINAL: this.servicoSelecionado.VALOR * (this.quantidade || 1),
      servico: { DESC_SERVICO: this.servicoSelecionado.DESC_SERVICO }
    };
  
    if (!this.cnpj || !this.selectedComanda) {
      this.showError('Erro: CNPJ ou Comanda não encontrados.');
      return;
    }
  
    this.comandasService.adicionarServico(this.cnpj, this.selectedComanda.COD_COMANDA, novoServico)
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço adicionado com sucesso!' });
  
          // ✅ Após adicionar, recarrega os serviços vinculados
          this.carregarServicosDaComanda(this.selectedComanda.CPF_CNPJ, this.selectedComanda.COD_COMANDA);
        },
        error: () => {
          this.showError('Erro ao adicionar o serviço.');
        }
      });
  }
  

  showError(message: string): void {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: message });
  }

  abrirComanda(comanda: any) {
    if (this.cnpj && comanda.COD_COMANDA) {
      // Navegar para a URL no formato: /dashboard/comandas/consultar/{CNPJ}/{COD_COMANDA}
      this.router.navigate([`/dashboard/comandas/consultar/${this.cnpj}/${comanda.COD_COMANDA}`]);
    }
  }
  
  voltar() {
    // Redireciona para a rota de consulta de comandas
    this.router.navigate(['/dashboard/comandas/consultar']).then(() => {
      // Recarrega as comandas em aberto após o redirecionamento
      this.carregarComandasEmAberto();
    });
  
    // Limpa a comanda selecionada
    this.selectedComanda = null;
  }

  atualizarValorFinal(servico: any, index: number) {
  // Atualiza o valor final com base na quantidade selecionada
  servico.VALOR_FINAL = servico.VALOR * servico.QUANTIDADE;

  // Atualiza o serviço na lista de serviços da comanda
  this.selectedComanda.SERVICOS[index] = servico;

  // Opcional: Atualizar o serviço no backend (se necessário)
  this.atualizarServicoNoBackend(servico);
}

habilitarEdicao(servico: any) {
  servico.editando = true; // Habilita a edição
}

// Método para confirmar a edição da quantidade
confirmarEdicao(servico: any, index: number) {
  servico.editando = false; // Desabilita a edição

  // Atualiza o valor final com base na nova quantidade
  servico.VALOR_FINAL = servico.VALOR * servico.QUANTIDADE;

  // Atualiza o serviço na lista de serviços da comanda
  this.selectedComanda.SERVICOS[index] = servico;

  // Opcional: Atualizar o serviço no backend (se necessário)
  this.atualizarServicoNoBackend(servico);
}

// Método para atualizar o serviço no backend
atualizarServicoNoBackend(servico: any) {
  if (!this.cnpj || !this.selectedComanda) {
    this.showError('Erro: CNPJ ou Comanda não encontrados.');
    return;
  }

  this.comandasService.adicionarServico(this.cnpj, this.selectedComanda.COD_COMANDA, servico)
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Quantidade atualizada com sucesso!' });
      },
      error: () => {
        this.showError('Erro ao atualizar a quantidade.');
      }
    });
}
 // Método para excluir um serviço
 excluirServico(servico: any, index: number) {
  this.confirmationService.confirm({
    message: `Tem certeza que deseja excluir o serviço "${servico.servico.DESC_SERVICO}"?`,
    header: 'Confirmação de Exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sim',
    rejectLabel: 'Não',
    acceptButtonStyleClass: 'p-button-danger p-button-text',
    rejectButtonStyleClass: 'p-button-text',
    accept: () => {
      this.confirmarExclusaoServico(servico, index);
    }
  });
}

confirmarExclusaoServico(servico: any, index: number) {
  if (!this.selectedComanda || !this.cnpj) {
    this.showError('Erro: CNPJ ou Comanda não encontrados.');
    return;
  }

  this.comandasService.excluirServico(this.cnpj, this.selectedComanda.COD_COMANDA, servico.COD_SERVICO)
    .subscribe({
      next: () => {
        // ✅ Remove o serviço da lista localmente
        this.selectedComanda.SERVICOS.splice(index, 1);
        this.selectedComanda = Object.assign({}, this.selectedComanda); // Força atualização da UI

        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído com sucesso!' });
      },
      error: () => {
        this.showError('Erro ao excluir o serviço.');
      }
    });
}

// Método para excluir o serviço no backend
excluirServicoNoBackend(servico: any) {
  if (!this.cnpj || !this.selectedComanda) {
    this.showError('Erro: CNPJ ou Comanda não encontrados.');
    return;
  }

  // Chama o serviço para excluir o serviço no backend
  this.comandasService.excluirServico(this.cnpj, this.selectedComanda.COD_COMANDA, servico.COD_SERVICO)
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Serviço excluído com sucesso!' });
      },
      error: () => {
        this.showError('Erro ao excluir o serviço.');
      }
    });
}

excluirComanda() {
  if (!this.selectedComanda) return;

  this.confirmationService.confirm({
    message: `Tem certeza que deseja excluir esta comanda?`,
    header: 'Confirmação',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Sim',
    rejectLabel: 'Não',
    acceptButtonStyleClass: 'p-button-danger p-button-text',
    rejectButtonStyleClass: 'p-button-text',
    accept: () => {
      this.confirmarExclusaoComanda();
    }
  });
}

confirmarExclusaoComanda() {
  if (!this.selectedComanda) return;

  this.comandasService.deleteComanda(this.selectedComanda.COD_COMANDA)
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Comanda excluída com sucesso!' });

        // ✅ Após excluir, volta para a página principal de comandas
        this.voltar();
      },
      error: () => {
        this.showError('Erro ao excluir a comanda.');
      }
    });
}

// Método para excluir a comanda no backend
excluirComandaNoBackend(comanda: any) {
  if (!comanda.COD_COMANDA) {
    this.showError('Erro: Código da Comanda não encontrado.');
    return;
  }

  this.comandasService.deleteComanda(comanda.COD_COMANDA)
    .subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Comanda excluída com sucesso!' });
      },
      error: () => {
        this.showError('Erro ao excluir a comanda.');
      }
    });
}

formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

}
