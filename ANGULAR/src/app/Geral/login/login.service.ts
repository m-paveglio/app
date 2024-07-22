import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/auth/login';

  constructor(private http: HttpClient) {}

  login(credentials: { CPF: string, SENHA: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // Credenciais inválidas
      return throwError('Credenciais inválidas. Verifique seu CPF e senha.');
    } else {
      // Outros erros
      return throwError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  }

  
}