import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class ServicosService {
private apiUrl: string;
 // Injetar ApiConfigService


  constructor(private http: HttpClient, private apiConfig: ApiConfigService) 
  {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/servicos`; // Construir a URL usando o ApiConfigService
  }
 
  getServicos(cnpj: string): Observable<any[]> {
    // A URL agora inclui o CNPJ na query string
    return this.http.get<any[]>(`${this.apiUrl}/CNPJ/${cnpj}`);
  }

  createServico(servico: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, servico);
  }

  updateServico(codServico: string, servico: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${codServico}`, servico);
  }

  deleteServico(codServico: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${codServico}`);
  }

  searchServico(descServico: string, cnpj: string): Observable<any[]> {
    const params = new HttpParams()
      .set('descServico', descServico)
      .set('cnpj', cnpj);
    return this.http.get<any[]>(`${this.apiUrl}/search`, { params });
  }


}
