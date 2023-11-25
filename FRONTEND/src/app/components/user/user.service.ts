import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  getUsers(cpf?: string, name?: string): Observable<any> {
    let url = this.baseUrl;

    if (cpf) {
      url += `?cpf=${cpf}`;
    } else if (name) {
      url += `?name=${name}`;
    }

    return this.http.get(url);
  }
}
