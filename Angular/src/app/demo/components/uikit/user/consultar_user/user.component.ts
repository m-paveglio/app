import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  templateUrl: './user.component.html',
})
export class UserComponent {
  cpf: string;
  nome: string;
  resultado: any;
  novoUsuario: any = {}; // Dados do novo usuário a serem adicionados ou editados

  constructor(private userService: UserService) {}

  buscarPorCpf() {
    this.userService.buscarPorCpf(this.cpf).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error) => {
        console.error('Erro ao buscar por CPF:', error);
      }
    );
  }

  buscarPorNome() {
    this.userService.buscarPorNome(this.nome).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error) => {
        console.error('Erro ao buscar por nome:', error);
      }
    );
  }

  adicionarUsuario() {
    this.userService.adicionarUsuario(this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.novoUsuario = {}; // Limpa os dados do novo usuário após adição
      },
      (error) => {
        console.error('Erro ao adicionar usuário:', error);
      }
    );
  }

  editarUsuario(cpf: string) {
    this.userService.editarUsuario(cpf, this.novoUsuario).subscribe(
      (data) => {
        this.resultado = data;
        this.novoUsuario = {}; // Limpa os dados do novo usuário após edição
      },
      (error) => {
        console.error('Erro ao editar usuário:', error);
      }
    );
  }

  excluirUsuario(cpf: string) {
    this.userService.excluirUsuario(cpf).subscribe(
      (data) => {
        this.resultado = data;
      },
      (error) => {
        console.error('Erro ao excluir usuário:', error);
      }
    );
  }
}
