import { Component } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { LoginService } from './login.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform: scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent {
    credentials = { cpf: '', password: '' };
    valCheck: string[] = ['remember'];
    password!: string;
    errorMessage: string | null = null; // Adicione esta linha

    constructor(private loginService: LoginService, public layoutService: LayoutService, private router: Router) { }


    onCPFInputChange(event: any) {
        this.credentials.cpf = event.target.value;
    }

    onPasswordInputChange(event: any) {
        this.credentials.password = event.target.value;
    }

    onLogin() {
        this.loginService.login(this.credentials).subscribe(
          (response) => {
            // Lógica para lidar com sucesso no login
            console.log('Login bem-sucedido!', response);
            this.router.navigate(['/']);
          },
          (error) => {
            // Lógica para lidar com falha no login
            console.error('Erro no login:', error);

            if (error === 'Credenciais inválidas. Verifique seu CPF e senha.') {
              this.errorMessage = 'Credenciais inválidas. Verifique seu CPF e senha.';
            } else {
              this.errorMessage = 'Erro ao tentar fazer login. Tente novamente mais tarde.';
            }
          }
        );
      }
    }
