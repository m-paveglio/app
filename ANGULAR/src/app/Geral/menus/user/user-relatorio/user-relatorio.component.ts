import { Component } from '@angular/core';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-relatorio',
  templateUrl: './user-relatorio.component.html'
})
export class UserRelatorioComponent {
  resultado: any;

  constructor(private userService: UserService) {}

  exportarRelatorio(): void {
    this.userService.exportarRelatorio().subscribe({
      next: (data: any) => {
        this.resultado = data;
        console.log('Relatório exportado com sucesso:', data);
      },
      error: (err: any) => {
        console.error('Erro ao exportar relatório:', err);
      }
    });
  }
}
