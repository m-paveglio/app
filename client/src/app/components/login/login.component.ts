import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms'; // Importe as classes necessárias
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm = new FormGroup({
    cpf: new FormControl(''),
    password: new FormControl('')
  });

  constructor(private authService: AuthService, private router: Router) {}

  login() {
    const cpf = this.loginForm.get('cpf')?.value; // Use o método get para obter o valor do FormControl
    const password = this.loginForm.get('password')?.value; // Use o método get para obter o valor do FormControl

    if (cpf && password) {
      this.authService.login(cpf, password).subscribe(
        (data) => {
          console.log('Login bem-sucedido:', data);
          this.router.navigate(['/home']);
        },
        (error) => {
          console.error('Erro no login:', error);
        }
      );
    } else {
      console.error('CPF ou senha não fornecidos.');
    }
  }
}
