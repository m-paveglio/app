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
  private apiUrl2: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/comandas`; // Construindo a URL com ApiConfigService
    this.apiUrl2 = `${this.apiConfig.getBaseUrl()}/comandasXservico`;
  }

  adicionarServico(CPF_CNPJ: string, COD_COMANDA: string, servico: any): Observable<any> {
    return this.http.post(`${this.apiUrl2}/${COD_COMANDA}`, servico)
      .pipe(catchError(this.handleError));
  }

  excluirServico(CNPJ: string, COD_COMANDA: string, COD_SERVICO: string): Observable<any> {
    return this.http.delete(`${this.apiUrl2}/${COD_COMANDA}/${COD_SERVICO}`)
      .pipe(catchError(this.handleError));
  }

  getComandaXservico(CPF_CNPJ: string, COD_COMANDA: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl2}/${COD_COMANDA}`)
      .pipe(catchError(this.handleError));
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

  getComanda(CNPJ: string, COD_COMANDA: string): Observable<{ data: any[] }> {
    return this.http.get<{ data: any[] }>(`${this.apiUrl}/${COD_COMANDA}`)
      .pipe(catchError(this.handleError));
  }

}
