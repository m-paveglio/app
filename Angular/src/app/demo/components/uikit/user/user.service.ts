import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:3000'; // Substitua pela URL real da sua API

  constructor(private http: HttpClient) {}

  buscarPorCpf(cpf: string): Observable<any> {
    const url = `${this.apiUrl}/user/${cpf}`;
    return this.http.get(url);
  }

  buscarPorNome(nome: string): Observable<any> {
    const url = `${this.apiUrl}/user/${nome}`;
    return this.http.get(url);
  }
}
