import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiConfigService } from '../../../../api-config.service';

@Injectable({
  providedIn: 'root',
})
export class EmpresasService {
  private apiUrl: string;
  
    constructor(private http: HttpClient, private apiConfig: ApiConfigService) {
      this.apiUrl = this.apiConfig.getBaseUrl(); // Pegar a URL base do ApiConfigService
    }
    
  buscarPorCnpj(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }
  
  buscarPorNome(NOME: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/nome/${NOME}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  adicionarEmpresa(empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa`;
    return this.http.post(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Empresa adicionada com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  editarEmpresa(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
      map(response => {
        this.handleSuccess('Empresa alterada com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  excluirEmpresa(CNPJ: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.delete(url).pipe(
      map(response => {
        this.handleSuccess('Empresa excluída com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  atualizarEmpresa(CNPJ: string, empresa: any): Observable<any> {
    const url = `${this.apiUrl}/empresa/${CNPJ}`;
    return this.http.patch(url, empresa).pipe(
        map(response => {
            this.handleSuccess('Usuário atualizado com sucesso!');
            return response;
        }),
        catchError(this.handleError)
    );
  }

  uploadCertificado(cnpj: string, certificado: Uint8Array, senha: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', new Blob([certificado]), 'certificado.pfx');
    formData.append('senha', senha);
    
    return this.http.post(`${this.apiUrl}/empresa/${cnpj}/upload-certificado`, formData);
  }

  // Método para enviar o arquivo .pfx
  enviarCertificado(cnpj: string, file: File, senha: string): Observable<any> {
    const url = `${this.apiUrl}/empresa/${cnpj}/upload-certificado`;
    
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('senha', senha);

    return this.http.post(url, formData).pipe(
      map(response => {
        this.handleSuccess('Certificado enviado com sucesso!');
        return response;
      }),
      catchError(this.handleError)
    );
  }

  getUploadUrl(CNPJ: string): string {
    return `${this.apiUrl}/empresa/${CNPJ}/upload-certificado`;
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

  getWebservices(): Observable<any[]> {  // ← Mudou de { data: any[] } para any[]
    return this.http.get<any[]>(`${this.apiUrl}/webservice`);  // Remove o tipo { data: any[] }
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

// Adicionar um CNAE a um CNPJ
adicionarCnae(CNPJ: string, COD_CNAE: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE`;
  return this.http.post(url, { CNPJ, COD_CNAE }).pipe(
    map(response => {
      this.handleSuccess('CNAE adicionado com sucesso!');
      return response;
    }),
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

adicionarCnaeEmpresa(CNPJ: string, COD_CNAE: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE`;
  return this.http.post(url, { CNPJ, COD_CNAE }).pipe(
    map(response => {
      this.handleSuccess('CNAE adicionado com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}

removerCnaeEmpresa(CNPJ: string, COD_CNAE: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE/${CNPJ}/${COD_CNAE}`;
  return this.http.delete(url).pipe(
    map(response => {
      this.handleSuccess('CNAE removido com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}


  ////////////////////////////////////////////////////////////////////////// ATIVIDADE MUNICIPAL
  ////////////////////////////////////////////////////////////////////////// ATIVIDADE MUNICIPAL
  ////////////////////////////////////////////////////////////////////////// ATIVIDADE MUNICIPAL
  ////////////////////////////////////////////////////////////////////////// ATIVIDADE MUNICIPAL


getCodigoTributacaoMunicipioVinculados(CNPJ: string): Observable<any[]> {
const url = `${this.apiUrl}/CodigoTributacaoMunicipio/${CNPJ}`;
return this.http.get<any[]>(url).pipe(
  catchError(this.handleError)
);
}


adicionarCodigoTributacaoMunicipio(dados: { CNPJ: string, COD_ATIVIDADE: string, DESC_ATIVIDADE?: string }): Observable<any> {
  const url = `${this.apiUrl}/CodigoTributacaoMunicipio`;
  return this.http.post(url, dados).pipe(
    map(response => {
      this.handleSuccess('Código de tributação adicionado com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}


removerCodigoTributacaoMunicipio(CNPJ: string, COD_ATIVIDADE: string): Observable<any> {
const url = `${this.apiUrl}/CodigoTributacaoMunicipio/${CNPJ}/${COD_ATIVIDADE}`;
return this.http.delete(url).pipe(
  map(response => {
    this.handleSuccess('atividade removida com sucesso!');
    return response;
  }),
  catchError(this.handleError)
);
}

EditarCodigoTributacaoMunicipio(CNPJ: string, COD_ATIVIDADE: string): Observable<any> {
  const url = `${this.apiUrl}/CodigoTributacaoMunicipio/${CNPJ}/${COD_ATIVIDADE}`;
  // Adicione um objeto vazio como corpo da requisição ou os dados que você quer enviar
  return this.http.patch(url, {}).pipe(
    map(response => {
      this.handleSuccess('CNAE removido com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}


  //////////////////////////////////////////////////////////////////////////ITEM LC
  //////////////////////////////////////////////////////////////////////////ITEM LC
  //////////////////////////////////////////////////////////////////////////ITEM LC
  //////////////////////////////////////////////////////////////////////////ITEM LC

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

// Adicionar um ITEMLC a um CNPJ
adicionarITEMLC(CNPJ: string, COD_ITEM_LC: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_ITEMLC`;
  return this.http.post(url, { CNPJ, COD_ITEM_LC }).pipe(
    map(response => {
      this.handleSuccess('ITEM LC adicionado com sucesso!');
      return response;
    }),
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

adicionarITEMLCEmpresa(CNPJ: string, COD_ITEM_LC: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE`;
  return this.http.post(url, { CNPJ, COD_ITEM_LC }).pipe(
    map(response => {
      this.handleSuccess('ITEM LC adicionado com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}

removerITEMLCEmpresa(CNPJ: string, COD_ITEM_LC: string): Observable<any> {
  const url = `${this.apiUrl}/EMPRESA_CNAE/${CNPJ}/${COD_ITEM_LC}`;
  return this.http.delete(url).pipe(
    map(response => {
      this.handleSuccess('ITEM LC removido com sucesso!');
      return response;
    }),
    catchError(this.handleError)
  );
}



  /*exportarRelatorio(): Observable<any> {
    const url = `${this.apiUrl}/empresa/export/excel`; // Corrigido
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }*/


}