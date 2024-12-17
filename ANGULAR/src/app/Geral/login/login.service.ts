import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { ApiConfigService } from '../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl: string;
  private readonly tokenKey = 'authToken';
  private readonly userNameKey = 'userName'; // Novo item para armazenar o nome do usuário
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiConfig: ApiConfigService // Injetar ApiConfigService
  ) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/auth/login`; // Construir a URL usando o ApiConfigService
  }

  login(credentials: { CPF: string; SENHA: string }): Observable<any> {
    return this.http.post<{ access_token: string; user: { nome: string } }>(this.apiUrl, credentials).pipe(
      tap((response) => this.handleLoginSuccess(response.access_token, response.user.nome)),
      catchError(this.handleError)
    );
  }

  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userNameKey); // Remover o nome do usuário
    }
    this.isLoggedInSubject.next(false);
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getUserName(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.userNameKey) : null;
  }

  private handleLoginSuccess(token: string, userName: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userNameKey, userName); // Armazenar o nome do usuário
    }
    this.isLoggedInSubject.next(true);
  }

  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem(this.tokenKey);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 401) {
      return throwError('Credenciais inválidas. Verifique seu CPF e senha.');
    } else {
      return throwError('Erro ao tentar fazer login. Tente novamente mais tarde.');
    }
  }
}
