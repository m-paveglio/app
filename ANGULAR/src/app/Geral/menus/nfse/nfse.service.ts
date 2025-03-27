import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NfseService {
  private apiUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/nfse`;
  }

  // Método para enviar a NFSe
  enviarNfse(nfseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar-lote`, nfseData);
  }

}