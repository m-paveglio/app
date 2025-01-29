import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class PessoasService {
  private apiUrl: string;
  private apiUrl1: string;
  private apiUrl2: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
    this.apiUrl = `${this.apiConfig.getBaseUrl()}/pessoas`; // Construir a URL usando ApiConfigService
    this.apiUrl1 = `${this.apiConfig.getBaseUrl()}/logradouro`; // Construir a URL usando ApiConfigService
    this.apiUrl2 = `${this.apiConfig.getBaseUrl()}/cidades`; // Construir a URL usando ApiConfigService
  }

  // POST: Criar uma nova pessoa
  createPessoa(pessoa: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, pessoa);
  }

  // PATCH: Atualizar uma pessoa
  atualizarpessoas(CPF_CNPJ: string, pessoa: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${CPF_CNPJ}`, pessoa);
  }

  // DELETE: Deletar uma pessoa
  deletePessoa(CPF_CNPJ: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${CPF_CNPJ}`);
  }

  // GET: Pesquisar pessoa pelo CPF ou Nome
  buscarPorCpf(CPF_CNPJ: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${CPF_CNPJ}`);
  }
  buscarPorNome(nome: string): Observable<any> {
    const url = `${this.apiUrl}/nome/${nome}`;
    return this.http.get(url).pipe(
    );
  }

  getEnderecoPorCEP(cep: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl1}/cep/${cep}`);
  }

  getCidadePorCodCidade(COD_CIDADE: string): Observable<any> {
    return this.http.get(`${this.apiUrl2}/${COD_CIDADE}`);
  }
}
