import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  login(cpf: string, password: string): Observable<any> {
    const loginData = { cpf, password };
    return this.http.post(`${this.apiUrl}/auth/login`, loginData)
      .pipe(
        map(response => {
          return response;
        }),
        catchError(error => {
          console.error('Erro no login:', error);
          throw error;
        })
      );
  }

  isLoggedIn(): boolean {
    // Implemente a lógica de verificação de autenticação aqui
    // Por exemplo, você pode verificar se o token de autenticação está presente no armazenamento local
    // Retorne true se o usuário estiver autenticado, caso contrário, retorne false
    return localStorage.getItem('token') !== null;
  }
}
