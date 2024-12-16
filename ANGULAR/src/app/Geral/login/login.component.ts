import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';  // Importe o MessageService

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService]  // Adicione o MessageService como provider
})
export class LoginComponent {
  credentials = { CPF: '', SENHA: '' };

  constructor(private loginService: LoginService, private router: Router, private messageService: MessageService) { }

  onCPFInputChange(event: any) {
    this.credentials.CPF = event.target.value.replace(/[.\-]/g, '');
  }

  onPasswordInputChange(event: any) {
    this.credentials.SENHA = event.target.value;
  }

  onLogin() {
    this.credentials.CPF = this.credentials.CPF.replace(/[.\-]/g, '');

    this.loginService.login(this.credentials).subscribe(
      (response) => {
        console.log('Login bem-sucedido!', response);
        this.router.navigate(['/dashboard']);
        this.mostrarMensagem('Login bem-sucedido!', true);
      },
      (error) => {
        console.error('Erro no login:', error);
        this.processarErro(error);
      }
    );
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('Credenciais inválidas')) {
      this.mostrarMensagem('Verifique seu CPF ou Senha.', false);
    } else {
      this.mostrarMensagem('Erro ao tentar fazer login. Tente novamente mais tarde.', false);
    }
  }

  mostrarMensagem(mensagem: string, sucesso: boolean) {
    this.messageService.add({
      severity: sucesso ? 'success' : 'error',
      summary: sucesso ? 'Sucesso' : 'Credenciais inválidas',
      detail: mensagem,
      life: 3000  // Tempo para o toast desaparecer (em milissegundos)
    });
  }
}
