import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-incluir',
  templateUrl: './user-incluir.component.html',
  styleUrls: ['./user-incluir.component.css']
})
export class UserIncluirComponent {

  mask: String = '';
  resultado: any;
  novoUsuario: any = {};
  mensagem: string = '';
  exibirMensagem: boolean = false;
  isCadastroSucesso: boolean = false;

  permissoes = [
    {nome: 'Administrador', codigo: '1'},
    {nome: 'Suporte', codigo: '2'},
    {nome: 'Contador', codigo: '3'},
    {nome: 'Diretor', codigo: '4'},
    {nome: 'Gerente', codigo: '5'},
    {nome: 'Procurador', codigo: '6'},
    {nome: 'Auxiliar Administrativo', codigo: '7'},
    {nome: 'Auxiliar Contábil', codigo: '8'},
    {nome: 'Atendente', codigo: '9'},
    {nome: 'Estagiário', codigo: '10'}
  ];

  USER_SIS = [
    {nome: 'Ativo', codigo: '1'},
    {nome: 'Desativado', codigo: '0'}
  ];

  constructor(private userService: UserService) {}

  adicionarUsuario() {
    this.userService.adicionarUsuario(this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.novoUsuario = {};
        this.mostrarMensagem('Usuário cadastrado com sucesso', true);
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
        if (error.error && error.error.message) {
          this.processarErro(error.error.message);
        } else {
          this.mostrarMensagem('Erro ao cadastrar usuário', false);
        }
      }
    );
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('usuário já existe')) {
      this.mostrarMensagem('Erro: o usuário já existe.', false);
    } else if (mensagemErro.includes('campos obrigatórios')) {
      this.mostrarMensagem('Erro: preencha todos os campos obrigatórios.', false);
    } else {
      this.mostrarMensagem('Erro ao cadastrar usuário', false);
    }
  }

  mostrarMensagem(mensagem: string, sucesso: boolean) {
    this.mensagem = mensagem;
    this.isCadastroSucesso = sucesso;
    this.exibirMensagem = true;
    setTimeout(() => {
      this.exibirMensagem = false;
    }, 3000);
  }
}