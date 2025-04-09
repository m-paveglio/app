import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
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

   //////////////////////////////////////////////////////////////////////////CNAE
  //////////////////////////////////////////////////////////////////////////CNAE
  //////////////////////////////////////////////////////////////////////////CNAE
  //////////////////////////////////////////////////////////////////////////CNAE

  buscarCNAE(params: { codigo?: string; descricao?: string }): Observable<any[]> {
    if (params.codigo) {
      // Busca por código
      const url = `${this.apiUrl}/cnae/${params.codigo}`;
      return this.http.get(url).pipe(
        map(response => [response]),
        catchError(this.handleError)
      );
    } 
    else if (params.descricao) {
      // Busca por descrição
      const url = `${this.apiUrl}/cnae/desc/${encodeURIComponent(params.descricao)}`;
      return this.http.get<any[]>(url).pipe(
        catchError(this.handleError)
      );
    }
    return of([]); // Retorna vazio se nenhum parâmetro
}
  
  // Buscar CNAEs vinculados a um CNPJ
getCnaesVinculados(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/EMPRESA_CNAE/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    catchError(this.handleError)
  );
}


// Buscar CNAEs de uma empresa
getEmpresaCnaes(CNPJ: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE/CNPJ/${CNPJ}`;
  return this.http.get(url).pipe(
    catchError(this.handleError)
  );
}

getCnaesDaEmpresa(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/EMPRESA_CNAE/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    // Adicione uma transformação para buscar as descrições
    switchMap(cnaesVinculados => {
      const requests = cnaesVinculados.map(cnae => 
        this.buscarCNAE({ codigo: cnae.COD_CNAE }).pipe(
          map(detalhes => ({
            COD_CNAE: cnae.COD_CNAE,
            DESC_CNAE: detalhes[0]?.DESC_CNAE || 'Descrição não encontrada'
          }))
        )
      );
      return forkJoin(requests);
    }),
    catchError(this.handleError)
  );
}

getCodigoTributacaoMunicipioVinculados(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/CodigoTributacaoMunicipio/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    catchError(this.handleError)
  );
  }


  buscarITEMLC(params: { codigo?: string; descricao?: string }): Observable<any[]> {
    if (params.codigo) {
      const url = `${this.apiUrl}/ITEMLC/${params.codigo}`;
      return this.http.get(url).pipe(
        map(response => [response]),
        catchError(this.handleError)
      );
    }
    else if (params.descricao) {
      const url = `${this.apiUrl}/ITEMLC/desc/${encodeURIComponent(params.descricao)}`;
      return this.http.get<any[]>(url).pipe(
        catchError(this.handleError)
      );
    }
    return of([]);
}
  
  
  // Buscar ITEMLC vinculados a um CNPJ
getITEMLCVinculados(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/EMPRESA_ITEMLC/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    catchError(this.handleError)
  );
}


// Buscar ITEMLC de uma empresa
getEmpresaITEMLCs(CNPJ: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_ITEMLC/CNPJ/${CNPJ}`;
  return this.http.get(url).pipe(
    catchError(this.handleError)
  );
}

getITEMLCDaEmpresa(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/EMPRESA_ITEMLC/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    // Adicione uma transformação para buscar as descrições
    switchMap(ITEMLCVinculados => {
      const requests = ITEMLCVinculados.map(ITEMLC => 
        this.buscarITEMLC({ codigo: ITEMLC.COD_ITEM_LC }).pipe(
          map(detalhes => ({
            COD_ITEM_LC: ITEMLC.COD_ITEM_LC,
            DESC_ITEM_LC: detalhes[0]?.DESC_ITEM_LC || 'Descrição não encontrada'
          }))
        )
      );
      return forkJoin(requests);
    }),
    catchError(this.handleError)
  );
}


consultarNfse(CNPJ: string): Observable<any[]> {
  const url = `${this.apiUrl}/nfse/CNPJ/${CNPJ}`;
  return this.http.get<any[]>(url).pipe(
    catchError(this.handleError)
  );
}

cancelarNfse(idNfse: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/nfse/cancelar`, { id: idNfse }).pipe(
    catchError(this.handleError)
  );
}

exportarParaExcel(nfses: any[]): Observable<Blob> {
  return this.http.post(`${this.apiUrl}/nfse/exportar-excel`, { nfses }, {
    responseType: 'blob'
  }).pipe(
    catchError(this.handleError)
  );
}





























  

    private handleError(error: any): Observable<never> {
      let errorMessage = 'Erro desconhecido';
      if (error.error instanceof ErrorEvent) {
        // Erro do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else if (error.status) {
        // Erro do servidor
        errorMessage = `Erro ${error.status}: ${error.error.message || error.statusText}`;
      }
      console.error(errorMessage);
      return throwError(errorMessage);
    }
  
    private handleSuccess(message: string): void {
      console.log(message); // ou você pode exibir a mensagem de sucesso de outra forma
   
    }

}