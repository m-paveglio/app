import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {
  private apiUrl = 'http://localhost:3000'; // Substitua pela URL real da sua API

  constructor(private http: HttpClient) {}

  buscarPorCnpj(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  buscarPorNome(nome: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/nome/${nome}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  adicionarEmpresa(empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa`;
    return this.http.post(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Empresa adicionada com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  editarEmpresa(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Empresa alterada com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  excluirEmpresa(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.delete(url).pipe(
      map(response => {
        this.handleSuccess('Empresa excluída com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  atualizarEmpresa(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
        map(response => {
            this.handleSuccess('Usuário atualizado com sucesso!');
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

  /*exportarRelatorio(): Observable<any> {
    const url = `${this.apiUrl}/empresa/export/excel`; // Corrigido
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }*/


}