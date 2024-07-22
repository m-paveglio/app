import { Component } from '@angular/core';
import { UserService } from '../pessoas.service';

@Component({
  selector: 'app-user-consultar',
  templateUrl: './user-consultar.component.html'
})
export class UserConsultarComponent {
  cpf: string ='';
  nome: string ='';
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