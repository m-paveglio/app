import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiConfigService } from '../../../../api-config.service';


@Injectable({
  providedIn: 'root',
})
export class UserXEmpresasService {
   private apiUrl: string;
   
     constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
       this.apiUrl = this.apiConfig.getBaseUrl(); // Pegar a URL base do ApiConfigService
     }

     buscarPorCnpj(CNPJ: string): Observable<any> {
      const url = `${this.apiUrl}/user-empresas/cnpj/${CNPJ}`;
      return this.http.get(url).pipe(catchError(this.handleError));
    }
    
    buscarPorCpf(CPF: string): Observable<any> {
      const url = `${this.apiUrl}/user-empresas/cpf/${CPF}`;
      return this.http.get(url).pipe(catchError(this.handleError));
    }
  
  adicionarVinculo(empresa: any): Observable<any> {
    const url = `${this.apiUrl}/user-empresa`;
    return this.http.post(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Vínculo adicionado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  editarVinculo(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/user-empresa/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Vínculo alterado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  excluirVinculo(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.delete(url).pipe(
      map(response => {
        this.handleSuccess('Vínculo excluído com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  atualizarVinculo(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/user-empresas/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
        map(response => {
            this.handleSuccess('Vínculo atualizado com sucesso!');
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

  getPermissoes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/permissoes`);
  }

  /*exportarRelatorio(): Observable<any> {
    const url = `${this.apiUrl}/empresa/export/excel`; // Corrigido
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }*/


}