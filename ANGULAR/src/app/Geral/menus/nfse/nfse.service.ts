
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NfseService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) 
   {
     this.apiUrl = `${this.apiConfig.getBaseUrl()}/servicos`; // Construir a URL usando o ApiConfigService
   }

  generateNfse(nfseData: any): Observable<any> {
    return this.http.post(this.apiUrl, nfseData);
  }
}
