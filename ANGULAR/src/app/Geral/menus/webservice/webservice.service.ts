import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class WebserviceService {
private apiUrl: string;
 // Injetar ApiConfigService


  constructor(private http: HttpClient, private apiConfig: ApiConfigService) 
  {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/webservice`; // Construir a URL usando o ApiConfigService
  }
 
  getWebservices(): Observable<any[]> {  // ← Mudou de { data: any[] } para any[]
    return this.http.get<any[]>(`${this.apiUrl}/`);  // Remove o tipo { data: any[] }
  }

  createWebservice(webservice: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, webservice);
  }

  updateWebservice(ID: number, webservice: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${ID}`, webservice);
  }

  deleteWebservice(ID: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${ID}`);
  }

  searchWebservice(NOME_CIDADE: string, ID: number): Observable<any[]> {
    const params = new HttpParams()
      .set('NOME_CIDADE', NOME_CIDADE)
    return this.http.get<any[]>(`${this.apiUrl}/desc/${NOME_CIDADE}`);
  }


}
