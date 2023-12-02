import { Component } from '@angular/core';
import { UserService } from './user.service';

@Component({
  templateUrl: './user.component.html',
})
export class UserComponent {
  cpf: string;
  nome: string;
  resultado: any;

  constructor(private userService: UserService) {}

  buscarPorCpf() {
    this.userService.buscarPorCpf(this.cpf).subscribe((data) => {
      this.resultado = data;
    });
  }

  buscarPorNome() {
    this.userService.buscarPorNome(this.nome).subscribe((data) => {
      this.resultado = data;
    });
  }
}
