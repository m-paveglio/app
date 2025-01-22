import { Injectable} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as https from 'https';
import { XmlUtilsService } from './common/xml-utils.service';
import { EmailService } from './common/email.service';

@Injectable()
export class NfseService {
  private readonly nfseEndpoint = 'https://www.issnetonline.com.br/homologaabrasf/webservicenfse204/nfse.asmx';

  constructor(
    private readonly httpService: HttpService,
    private readonly xmlUtils: XmlUtilsService,
    private readonly emailService: EmailService,
  ) {}

  async enviarLoteRps(dados: any): Promise<any> {
    // Gerar XML
    const xml = await this.xmlUtils.gerarXml('enviar-lote-rps', dados);

    // Configurar HTTPS com certificado
    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync('certificado.pfx'),
      passphrase: 'senha-certificado',
    });

    // Enviar requisição SOAP
    const response = await this.httpService
      .post(this.nfseEndpoint, xml, {
        headers: {
          'Content-Type': 'text/xml;charset=utf-8',
          'SOAPAction': 'http://nfse.abrasf.org.br/RecepcionarLoteRps',
          'User-Agent': 'MeuSistema/1.0',
        },
        httpsAgent,
      })
      .toPromise();

    // Retornar resposta do servidor
    return response.data;
  }

  async consultarSituacao(dados: any): Promise<any> {
    const xml = await this.xmlUtils.gerarXml('consultar-situacao', dados);

    const response = await this.httpService
      .post(this.nfseEndpoint, xml, {
        headers: {
          'Content-Type': 'text/xml;charset=utf-8',
          'SOAPAction': 'http://nfse.abrasf.org.br/ConsultarSituacaoLoteRps',
        },
      })
      .toPromise();

    return response.data;
  }

  async enviarEmailComNota(tomadorEmail: string, xmlNota: string): Promise<void> {
    await this.emailService.enviarEmail({
      to: tomadorEmail,
      subject: 'Nota Fiscal Eletrônica - Autorizada',
      body: 'Segue em anexo a nota fiscal autorizada.',
      attachments: [{ filename: 'nota-fiscal.xml', content: xmlNota }],
    });
  }
}
