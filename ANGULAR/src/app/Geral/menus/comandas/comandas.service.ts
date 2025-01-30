import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ComandasService { // Nome da classe corrigido (Padrão PascalCase)
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/comandas`; // Construindo a URL com ApiConfigService
  }

  // ✅ Buscar comandas por CPF/CNPJ
  getComandas(CPF_CNPJ: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/CPF_CNPJ/${CPF_CNPJ}`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Criar uma nova comanda
  createComanda(comanda: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, comanda)
      .pipe(catchError(this.handleError));
  }

  // ✅ Atualizar comanda existente
  updateComanda(COD_COMANDA: string, comanda: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${COD_COMANDA}`, comanda)
      .pipe(catchError(this.handleError));
  }

  // ✅ Excluir comanda pelo código
  deleteComanda(COD_COMANDA: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${COD_COMANDA}`)
      .pipe(catchError(this.handleError));
  }

  // ✅ Buscar comandas pelo nome do usuário
  searchComanda(NOME: string): Observable<any[]> {
    const params = new HttpParams().set('NOME', NOME);
    return this.http.get<any[]>(`${this.apiUrl}/NOME`, { params })
      .pipe(catchError(this.handleError));
  }

  // 🔹 Tratamento de erros centralizado
  private handleError(error: any) {
    console.error('Erro na requisição:', error);
    return throwError(() => new Error('Erro ao processar a solicitação, tente novamente mais tarde.'));
  }

  getComandasAbertas(cnpj: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/EmAberto/${cnpj}`)
      .pipe(catchError(this.handleError));
  }

}
