import { Component } from '@angular/core';
import { UserService } from '../user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-incluir',
  templateUrl: './user-incluir.component.html',
  providers: [MessageService]
})
export class UserIncluirComponent {
  
  mask: String = '';
  resultado: any;
  novoUsuario: any = {};
  permissoes = [
    { nome: 'Administrador', codigo: '1' },
    { nome: 'Suporte', codigo: '2' },
    { nome: 'Contador', codigo: '3' },
    { nome: 'Diretor', codigo: '4' },
    { nome: 'Gerente', codigo: '5' },
    { nome: 'Procurador', codigo: '6' },
    { nome: 'Auxiliar Administrativo', codigo: '7' },
    { nome: 'Auxiliar Contábil', codigo: '8' },
    { nome: 'Atendente', codigo: '9' },
    { nome: 'Estagiário', codigo: '10' }
  ];

  USER_SIS = [
    { nome: 'Ativo', codigo: '1' },
    { nome: 'Desativado', codigo: '0' }
  ];

  constructor(
    private userService: UserService,
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
}
