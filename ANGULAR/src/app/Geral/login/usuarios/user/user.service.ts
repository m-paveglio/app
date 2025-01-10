import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from '../../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = this.apiConfig.getBaseUrl(); // Pegar a URL base do ApiConfigService
  }

  buscarPorCpf(cpf: string): Observable<any> {
    const url = `${this.apiUrl}/user/${cpf}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  buscarPorNome(nome: string): Observable<any> {
    const url = `${this.apiUrl}/user/nome/${nome}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  adicionarUsuario(usuario: any): Observable<any> {
    const url = `${this.apiUrl}/user`;
    return this.http.post(url, usuario).pipe(
      map(response => {
        this.handleSuccess('Usuário adicionado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  editarUsuario(cpf: string, usuario: any): Observable<any> {
    const url = `${this.apiUrl}/user/${cpf}`;
    return this.http.patch(url, usuario).pipe(
      map(response => {
        this.handleSuccess('Usuário editado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  excluirUsuario(cpf: string): Observable<any> {
    const url = `${this.apiUrl}/user/${cpf}`;
    return this.http.delete(url).pipe(
      map(response => {
        this.handleSuccess('Usuário excluído com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  atualizarUsuario(cpf: string, usuario: any): Observable<any> {
    const url = `${this.apiUrl}/user/${cpf}`;
    return this.http.patch(url, usuario).pipe(
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

  exportarRelatorio(): Observable<any> {
    const url = `${this.apiUrl}/user/export/excel`; // Corrigido
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  getPermissoes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissoes`);
  }

  buscarPorCnpj(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

}