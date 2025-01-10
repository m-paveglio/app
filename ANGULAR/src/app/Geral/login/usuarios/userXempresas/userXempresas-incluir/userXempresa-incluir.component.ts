import { Component } from '@angular/core';
import { UserXEmpresasService } from '../userXempresas.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-userXempresa-incluir',
  templateUrl: './userXempresa-incluir.component.html',
  providers: [MessageService]
})
export class UserXEmpresaIncluirComponent {
  
  mask: String = '';
  resultado: any;
  novoUsuario: any = {};
  permissoes: any[] = [];

  TIPO_USER = [
    { nome: 'Admin', codigo: '1' },
    { nome: 'Suporte', codigo: '2' },
    { nome: 'Usuário', codigo: '3' }
  ];

  constructor(
    private userService: UserXEmpresasService,
    private messageService: MessageService
  ) {}

  adicionarUsuario() {
    this.userService.adicionarUsuario(this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.novoUsuario = {};
        this.showSuccess('Usuário cadastrado com sucesso');
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.showError('Erro ao cadastrar usuário');
        }
      }
    );
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('usuário já existe')) {
      this.showError('Erro: o usuário já existe.');
    } else if (mensagemErro.includes('campos obrigatórios')) {
      this.showError('Erro: preencha todos os campos obrigatórios.');
    } else {
      this.showError('Erro ao cadastrar usuário');
    }
  }

  showSuccess(mensagem: string) {
    this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: mensagem });
  }

  showError(mensagem: string) {
    this.messageService.add({ severity: 'error', summary: 'Erro', detail: mensagem });
  }



  carregarPermissoes() {
    this.userService.getPermissoes().subscribe(
      (data) => {
        this.permissoes = data; // Carrega as permissões do backend
      },
      (error) => {
        console.error('Erro ao carregar permissões:', error);
        this.showError('Erro ao carregar permissões. Tente novamente.');
      }
    );
  }

  getPermissaoNome(codigo: string) {
    let permissao = this.permissoes.find(p => p.codigo === codigo);
    return permissao ? permissao.nome : '';
  }
}