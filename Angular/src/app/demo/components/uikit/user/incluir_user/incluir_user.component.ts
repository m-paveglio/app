import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
    templateUrl: './incluir_user.component.html'
})
export class IncluirUserComponent {

    mask: String;
    resultado: any;
    novoUsuario: any = {};

      constructor(private userService: UserService) {}

      adicionarUsuario() {
        this.userService.adicionarUsuario(this.novoUsuario).subscribe(
          (data) => {
            this.resultado = data;
            this.novoUsuario = {};
          },
          (error) => {
            console.error('Erro ao adicionar usuário:', error);
            // Adicione esta linha para imprimir o erro detalhado no console
            console.error('Detalhes do erro:', error.error);
          }
        );
        }

       

    }
