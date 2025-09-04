import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { parseStringPromise } from 'xml2js';
import * as xmldom from 'xmldom';
import { EmpresasService } from 'src/Login/empresas/empresas.service';
import { WebserviceService } from '../../Consultas/webservice/webservice.service';

@Injectable()
export class CancelarNfseService {
  private readonly logger = new Logger(CancelarNfseService.name);
  private readonly DOMParser = xmldom.DOMParser;
  private readonly XMLSerializer = xmldom.XMLSerializer;

  constructor(
    private readonly httpService: HttpService,
    private readonly empresasService: EmpresasService,
    private readonly webserviceService: WebserviceService,
  ) {}

  async cancelarNfse(
    cnpj: string,
    numero: string,
    inscricaoMunicipal: string,
    codigoMunicipio: string,
    codigoCancelamento: number
  ): Promise<any> {
    try {
      this.logger.debug(`Iniciando cancelamento de NFS-e para CNPJ: ${cnpj}`);

      // 1. Busca dados da empresa
      const empresa = await this.empresasService.getEmpresa(cnpj);
      if (empresa instanceof HttpException) throw empresa;
      if (!empresa.AMBIENTE_INTEGRACAO_ID || !empresa.IM) {
        throw new HttpException('Dados incompletos da empresa', HttpStatus.BAD_REQUEST);
      }

      // 2. Busca webservice
      const webservice = await this.webserviceService.getWebservice(empresa.AMBIENTE_INTEGRACAO_ID);
      if (!webservice?.LINK) {
        throw new HttpException('Webservice não configurado', HttpStatus.BAD_REQUEST);
      }

      // 3. Gera XML
      const xmlCancelamento = this.gerarXmlCancelamento(
        numero,
        cnpj,
        inscricaoMunicipal,
        codigoMunicipio,
        codigoCancelamento,
      );
      this.logger.verbose('XML de cancelamento gerado:', xmlCancelamento.substring(0, 1000) + '...');

      // 4. Busca certificado
      const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpj);

      // 5. Assina XML
      const xmlAssinado = await this.assinarXml(xmlCancelamento, pfx, passphrase);

      // 6. Configura agente HTTPS
      const httpsAgent = this.criarAgenteHttps(pfx, passphrase);

      // 7. Envia requisição
      const response = await this.enviarRequisicao(webservice.LINK, xmlAssinado, httpsAgent);

      // 8. Processa resposta
      const resultado = await this.processarResposta(response.data);
      return resultado;

    } catch (error) {
      this.logger.error('Erro ao cancelar NFS-e:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      throw error instanceof HttpException
        ? error
        : new HttpException('Falha no cancelamento de NFS-e', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private gerarXmlCancelamento(
    numero: string,
    cnpj: string,
    inscricaoMunicipal: string,
    codigoMunicipio: string,
    codigoCancelamento: number
  ): string {
    return `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://nfse.abrasf.org.br">
        <soap:Body>
          <svc:CancelarNfse>
            <nfseCabecMsg>
              <cabecalho versao="2.04">
                <versaoDados>2.04</versaoDados>
              </cabecalho>
            </nfseCabecMsg>
            <nfseDadosMsg>
              <CancelarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
                <Pedido>
                  <InfPedidoCancelamento Id="s01">
                    <IdentificacaoNfse>
                      <Numero>${numero}</Numero>
                      <CpfCnpj>
                        <Cnpj>${cnpj}</Cnpj>
                      </CpfCnpj>
                      <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
                      <CodigoMunicipio>${codigoMunicipio}</CodigoMunicipio>
                    </IdentificacaoNfse>
                    <CodigoCancelamento>${codigoCancelamento}</CodigoCancelamento>
                  </InfPedidoCancelamento>
                </Pedido>
              </CancelarNfseEnvio>
            </nfseDadosMsg>
          </svc:CancelarNfse>
        </soap:Body>
      </soap:Envelope>
    `.trim();
  }

  private criarAgenteHttps(pfx: Buffer, passphrase: string): https.Agent {
    return new https.Agent({
      pfx,
      passphrase,
      rejectUnauthorized: false,
      secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1,
    });
  }

  private async enviarRequisicao(url: string, xml: string, httpsAgent: https.Agent) {
    return this.httpService.post(url, xml, {
      headers: {
        'Content-Type': 'text/xml;charset=utf-8',
        'SOAPAction': 'http://nfse.abrasf.org.br/CancelarNfse',
      },
      httpsAgent,
      timeout: 30000,
    }).toPromise();
  }

  private async assinarXml(xml: string, pfx: Buffer, passphrase: string): Promise<string> {
    try {
      this.logger.debug('Iniciando processo de assinatura digital (cancelamento)');

      const p12Asn1 = forge.asn1.fromDer(pfx.toString('binary'));
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

      const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
      const privateKeyObj = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
      const privateKey = forge.pki.privateKeyToPem(privateKeyObj);

      const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
      const certificate = certBag[forge.pki.oids.certBag][0].cert;
      const publicCert = forge.pki.certificateToPem(certificate);

      const xmlDoc = new this.DOMParser().parseFromString(xml, "text/xml");
      const infPedidoCancelamentoNode =
        xmlDoc.getElementsByTagName("InfPedidoCancelamento")[0] ||
        xmlDoc.getElementsByTagNameNS("http://www.abrasf.org.br/nfse.xsd", "InfPedidoCancelamento")[0];

      if (!infPedidoCancelamentoNode) {
        throw new Error("Nó InfPedidoCancelamento não encontrado no XML para assinatura");
      }

      // cria assinatura
      const signature = this.criarAssinatura(infPedidoCancelamentoNode, privateKey, publicCert);

      // adiciona no nó <Pedido>
      const pedidoNode = xmlDoc.getElementsByTagName("Pedido")[0];
      pedidoNode.appendChild(signature);

      const xmlAssinado = new this.XMLSerializer().serializeToString(xmlDoc);

      this.logger.verbose('XML assinado (início):', xmlAssinado.substring(0, 5000) + '...');

      return xmlAssinado;
    } catch (error) {
      this.logger.error('Falha na assinatura XML:', {
        message: error.message,
        stack: error.stack,
      });

      if (error.message.includes('PKCS#12 MAC could not be verified') && passphrase) {
        this.logger.warn('Tentando assinar com senha vazia...');
        return this.assinarXml(xml, pfx, '');
      }

      throw new Error(`Falha na assinatura: ${error.message}`);
    }
  }

  private criarAssinatura(nodeToSign: any, privateKeyPem: string, publicCertPem: string): Node {
    const canonicalXml = this.canonicalizeXml(nodeToSign);

    const digest = crypto.createHash('sha1').update(canonicalXml).digest('base64');

    const sign = crypto.createSign('RSA-SHA1');
    sign.update(canonicalXml);
    const signatureValue = sign.sign(privateKeyPem, 'base64');

    const x509Certificate = publicCertPem
      .replace('-----BEGIN CERTIFICATE-----', '')
      .replace('-----END CERTIFICATE-----', '')
      .replace(/\n/g, '')
      .replace(/\r/g, '');

    const signatureXml = `
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
          <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
          <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
          <Reference URI="">
            <Transforms>
              <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
            </Transforms>
            <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"/>
            <DigestValue>${digest}</DigestValue>
          </Reference>
        </SignedInfo>
        <SignatureValue>${signatureValue}</SignatureValue>
        <KeyInfo>
          <X509Data>
            <X509Certificate>${x509Certificate}</X509Certificate>
          </X509Data>
        </KeyInfo>
      </Signature>
    `;

    return new this.DOMParser().parseFromString(signatureXml, "text/xml").documentElement;
  }

  private canonicalizeXml(node: any): string {
    const serializer = new this.XMLSerializer();
    let xml = serializer.serializeToString(node);
    xml = xml.replace(/>\s+</g, '><');
    xml = xml.replace(/\s+/g, ' ');
    return xml.trim();
  }

  private async processarResposta(xmlResposta: string): Promise<any> {
    try {
      const resultado = await parseStringPromise(xmlResposta, {
        explicitArray: false,
        ignoreAttrs: false,
        tagNameProcessors: [name => name.replace(/^[a-zA-Z]+:/, '')],
      });

      const resposta = resultado?.Envelope?.Body?.CancelarNfseResponse?.CancelarNfseResposta;

      if (!resposta) {
        this.logger.debug('Nenhuma resposta de cancelamento encontrada');
        return null;
      }

      return resposta;
    } catch (error) {
      throw new Error(`Falha ao processar resposta: ${error.message}`);
    }
  }
}
