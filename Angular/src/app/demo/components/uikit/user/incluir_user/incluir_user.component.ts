import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
    templateUrl: './incluir_user.component.html'
})
export class IncluirUserComponent {

    resultado: any;
    novoUsuario: any

      constructor(private userService: UserService) {}

      adicionarUsuario() {
        this.userService.adicionarUsuario(this.novoUsuario).subscribe(
            (data) => {
                this.resultado = data;
                this.novoUsuario = {}; // L impa os dados do novo usuário após adição
            },
            (error) => {
                console.error('Erro ao adicionar usuário:', error);
            }
        );
    }


}
