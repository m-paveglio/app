import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { CPF: '', SENHA: '' };
  mensagem: string | null = null;
  isLoginSucesso: boolean = false;
  exibirMensagem: boolean = false;

  constructor(private loginService: LoginService, private router: Router) { }

  onCPFInputChange(event: any) {
    // Atualiza o CPF removendo pontos e hífens enquanto o usuário digita
    this.credentials.CPF = event.target.value.replace(/[.\-]/g, '');
  }

  onPasswordInputChange(event: any) {
    this.credentials.SENHA = event.target.value;
  }

  onLogin() {
    // Remove os pontos e hífens do CPF antes de fazer login
    this.credentials.CPF = this.credentials.CPF.replace(/[.\-]/g, '');

    this.loginService.login(this.credentials).subscribe(
      (response) => {
        console.log('Login bem-sucedido!', response);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        console.error('Erro no login:', error);
        this.processarErro(error);
      }
    );
  }

  processarErro(mensagemErro: string) {
    if (mensagemErro.includes('Credenciais inválidas')) {
      this.mostrarMensagem('Credenciais inválidas, verifique seu CPF ou Senha.', false);
    } else {
      this.mostrarMensagem('Erro ao tentar fazer login. Tente novamente mais tarde.', false);
    }
  }

  mostrarMensagem(mensagem: string, sucesso: boolean) {
    this.mensagem = mensagem;
    this.isLoginSucesso = sucesso;
    this.exibirMensagem = true;
    setTimeout(() => {
      this.exibirMensagem = false;
    }, 3000);
  }
}
