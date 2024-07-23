
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NfseService {
  private apiUrl = 'http://localhost:3000'; // Ajuste a URL conforme necessário

  constructor(private http: HttpClient) {}

  generateNfse(nfseData: any): Observable<any> {
    return this.http.post(this.apiUrl, nfseData);
  }
}
