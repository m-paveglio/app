import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000'; // Substitua pela URL real da sua API

  constructor(private http: HttpClient) {}

  buscarPorCpf(cpf: string): Observable<any> {
    const url = `${this.apiUrl}/pessoas/${cpf}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  buscarPorNome(nome: string): Observable<any> {
    const url = `${this.apiUrl}/pessoas/${nome}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  adicionarPessoa(usuario: any): Observable<any> {
    const url = `${this.apiUrl}/pessoas`;
    return this.http.post(url, usuario).pipe(
      map(response => {
        this.handleSuccess('Adicionado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  editarPessoa(cpf: string, usuario: any): Observable<any> {
    const url = `${this.apiUrl}/pessoas/${cpf}`;
    return this.http.patch(url, usuario).pipe(
      map(response => {
        this.handleSuccess('Editado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

   private handleError(error: any): Observable<never> {
    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else if (error.status) {
      // Erro do servidor
      errorMessage = `Erro ${error.status}: ${error.error.message || error.statusText}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

  private handleSuccess(message: string): void {
    console.log(message); // ou você pode exibir a mensagem de sucesso de outra forma
 
  }


}