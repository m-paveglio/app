import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root'
})
export class NfseService {
  private apiUrl: string;
  private cidadesCache: any[] = []; // Cache para armazenar as cidades

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}`;
  }

  // Método para enviar a NFSe
  enviarNfse(nfseData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/nfse/enviar-lote`, nfseData);
  }

  carregarCidades(): Observable<any> {
    if (this.cidadesCache.length > 0) {
      return of(this.cidadesCache); // Retorna do cache se já tiver carregado
    }
    return this.http.get(`${this.apiUrl}/cidades`).pipe(
      tap((cidades: any) => {
        this.cidadesCache = cidades; // Armazena no cache
      })
    );
  }

}