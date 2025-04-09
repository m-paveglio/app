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
  private empresaSelecionada = new BehaviorSubject<any>(null);
  

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private apiConfig: ApiConfigService // Injetar ApiConfigService

  ) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/auth/login`; // Construir a URL usando o ApiConfigService
  }

  login(credentials: { CPF: string; SENHA: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap((response) => {
        const token = response.access_token;
        const user = response.user;
        this.handleLoginSuccess(token, user.nome, user.CPF); // 👈 Passando o CPF
      }),
      catchError(this.handleError)
    );
  }
  
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem(this.tokenKey); // Usando localStorage em vez de localStorage
      localStorage.removeItem(this.userNameKey); // Remover o nome do usuário também
    }
    this.isLoggedInSubject.next(false);
  }
  
  private handleLoginSuccess(token: string, userName: string, cpf: string): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.userNameKey, userName);
      localStorage.setItem('cpfUsuarioLogado', cpf); // 👈 CPF salvo com sucesso!
    }
    this.isLoggedInSubject.next(true);
  }
  
  private hasToken(): boolean {
    return this.isBrowser() && !!localStorage.getItem(this.tokenKey); // Verificando no localStorage
  }

  isAuthenticated(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getUserName(): string | null {
    return this.isBrowser() ? localStorage.getItem(this.userNameKey) : null;
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

  setEmpresaSelecionada(empresa: any): void {
    this.empresaSelecionada.next(empresa); // Atualiza o BehaviorSubject corretamente
    localStorage.setItem('empresaSelecionada', JSON.stringify(empresa));
  }
  
  getEmpresaSelecionada(): any {
    if (!this.empresaSelecionada.value) { // Se ainda não foi inicializado, busca do localStorage
      const storedEmpresa = localStorage.getItem('empresaSelecionada');
      if (storedEmpresa) {
        this.empresaSelecionada.next(JSON.parse(storedEmpresa));
      }
    }
    return this.empresaSelecionada.value; // Retorna o valor atualizado corretamente
  }

  getCpfUsuarioLogado(): string | null {
    return localStorage.getItem('cpfUsuarioLogado');
  }
  
  buscarPorCnpj(CNPJ: string): Observable<any> {
    // Ajusta para usar apenas o endpoint /empresa
    const url = `${this.apiConfig.getBaseUrl()}/empresa/${CNPJ}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

}
