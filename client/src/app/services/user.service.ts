import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) { }

  getUsersByNameOrCpf(searchTerm: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // Outros cabeçalhos se necessário
    });

    const params = new HttpParams().set('searchTerm', searchTerm);

    return this.http.get(`${this.apiUrl}`, { headers, params });
  }
}
