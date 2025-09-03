import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import { parseStringPromise } from 'xml2js';
import * as xmldom from 'xmldom';
import { EmpresasService } from 'src/Login/empresas/empresas.service';
import { WebserviceService } from '../webservice/webservice.service';

@Injectable()
export class ConsultarURLService {
  private readonly logger = new Logger(ConsultarURLService.name);
  private readonly DOMParser = xmldom.DOMParser;
  private readonly XMLSerializer = xmldom.XMLSerializer;

  constructor(
    private readonly httpService: HttpService,
    private readonly empresasService: EmpresasService,
    private readonly webserviceService: WebserviceService,
  ) {}

  async consultarPdf(
  cnpj: string,
  numero: string,
  serie: string,
  tipo: number
): Promise<{ visualizacao?: string; autenticidade?: string } | null> {
    try {
      this.logger.debug(`Iniciando consulta de URL do PDF para CNPJ: ${cnpj}`);

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
      const xmlConsulta = this.gerarXmlConsulta(cnpj, empresa.IM, numero, serie, tipo);
      this.logger.verbose('XML gerado:', xmlConsulta.substring(0, 1000) + '...');

      // 4. Busca certificado
      const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpj);

      // 5. Assina XML
      const xmlAssinado = await this.assinarXml(xmlConsulta, pfx, passphrase);

      // 6. Configura agente HTTPS
      const httpsAgent = this.criarAgenteHttps(pfx, passphrase);

      // 7. Envia requisição
      const response = await this.enviarRequisicao(webservice.LINK, xmlAssinado, httpsAgent);

      // 8. Processa resposta
      const urls = await this.processarResposta(response.data);
      return urls;

    } catch (error) {
      this.logger.error('Erro ao consultar PDF:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      throw error instanceof HttpException
        ? error
        : new HttpException('Falha na consulta de PDF', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private gerarXmlConsulta(cnpj: string, inscricaoMunicipal: string, numero: string, serie: string, tipo: number): string {
    return `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://nfse.abrasf.org.br">
        <soap:Body>
          <svc:ConsultarUrlNfse>
            <nfseCabecMsg>
              <cabecalho versao="2.04">
                <versaoDados>2.04</versaoDados>
              </cabecalho>
            </nfseCabecMsg>
            <nfseDadosMsg>
              <ConsultarUrlNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
                <Pedido>
                  <Prestador>
                    <CpfCnpj>
                      <Cnpj>${cnpj}</Cnpj>
                    </CpfCnpj>
                    <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
                  </Prestador>
                  <IdentificacaoRps>
                    <Numero>${numero}</Numero>
                    <Serie>${serie}</Serie>
                    <Tipo>${tipo}</Tipo>
                  </IdentificacaoRps>
                  <Pagina>1</Pagina>
                </Pedido>
              </ConsultarUrlNfseEnvio>
            </nfseDadosMsg>
          </svc:ConsultarUrlNfse>
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
        'SOAPAction': 'http://nfse.abrasf.org.br/ConsultarUrlNfse',
      },
      httpsAgent,
      timeout: 30000,
    }).toPromise();
  }

  private async assinarXml(xml: string, pfx: Buffer, passphrase: string): Promise<string> {
    try {
        this.logger.debug('Iniciando processo de assinatura digital');

        // 1. Converter o certificado PFX para o formato P12
        const p12Asn1 = forge.asn1.fromDer(pfx.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
        
        // 2. Extrair a chave privada
        const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const privateKeyObj = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
        const privateKey = forge.pki.privateKeyToPem(privateKeyObj);
        
        // 3. Extrair o certificado público
        const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certificate = certBag[forge.pki.oids.certBag][0].cert;
        const publicCert = forge.pki.certificateToPem(certificate);
        
        // 4. Parsear o XML
        const xmlDoc = new this.DOMParser().parseFromString(xml, "text/xml");
        const consultaNode =
          xmlDoc.getElementsByTagName("ConsultarUrlNfseEnvio")[0] ||
          xmlDoc.getElementsByTagNameNS("http://www.abrasf.org.br/nfse.xsd", "ConsultarUrlNfseEnvio")[0];

        if (!consultaNode) {
          throw new Error("Nó ConsultarUrlNfseEnvio não encontrado no XML para assinatura");
        }
        
        // 5. Criar assinatura usando a mesma abordagem do NfseService
        const signature = this.criarAssinatura(consultaNode, privateKey, publicCert);
        consultaNode.appendChild(signature);
        
        // 6. Serializar o XML assinado
        const xmlAssinado = new this.XMLSerializer().serializeToString(xmlDoc);

        // Log do XML assinado (apenas parte inicial)
        this.logger.verbose('XML assinado (início):', xmlAssinado.substring(0, 5000) + '...');

        // Salvar em arquivo para debug (apenas em desenvolvimento)
        if (process.env.NODE_ENV === 'development') {
            const fs = require('fs');
            const path = require('path');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = path.join(__dirname, `../../../logs/xml-consulta-rps-${timestamp}.xml`);
            fs.writeFileSync(filePath, xmlAssinado);
            this.logger.debug(`XML assinado salvo em: ${filePath}`);
        }

        return xmlAssinado;
    } catch (error) {
        this.logger.error('Falha na assinatura XML:', {
            message: error.message,
            stack: error.stack
        });
        
        // Tentar fallback para senha vazia se a senha fornecida falhar
        if (error.message.includes('PKCS#12 MAC could not be verified') && passphrase) {
            this.logger.warn('Tentando assinar com senha vazia...');
            return this.assinarXml(xml, pfx, '');
        }
        
        throw new Error(`Falha na assinatura: ${error.message}`);
    }
  }

  private criarAssinatura(nodeToSign: any, privateKeyPem: string, publicCertPem: string): Node {
    // Canonicalizar o nó
    const canonicalXml = this.canonicalizeXml(nodeToSign);
    
    // Calcular DigestValue
    const digest = crypto.createHash('sha1').update(canonicalXml).digest('base64');
    
    // Assinar o DigestValue
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(canonicalXml);
    const signatureValue = sign.sign(privateKeyPem, 'base64');
    
    // Certificado em Base64
    const x509Certificate = publicCertPem
        .replace('-----BEGIN CERTIFICATE-----', '')
        .replace('-----END CERTIFICATE-----', '')
        .replace(/\n/g, '')
        .replace(/\r/g, '');
    
    // Criar elemento Signature
    const signatureXml = `
      <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
        <SignedInfo>
          <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
          <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"/>
          <Reference>
            <Transforms>
              <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"/>
              <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
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

  private async processarResposta(xmlResposta: string): Promise<{ visualizacao?: string; autenticidade?: string } | null> {
  try {
    const resultado = await parseStringPromise(xmlResposta, {
      explicitArray: false,
      ignoreAttrs: false,
      tagNameProcessors: [name => name.replace(/^[a-zA-Z]+:/, '')],
    });

    const links =
      resultado?.Envelope?.Body?.ConsultarUrlNfseResponse?.ConsultarUrlNfseResposta?.ListaLinks?.Links;

    if (!links) {
      this.logger.debug('Nenhum link encontrado na resposta');
      return null;
    }

    const urls = {
      visualizacao: links?.UrlVisualizacaoNfse || null,
      autenticidade: links?.UrlVerificaAutenticidade || null,
    };

    return urls;
  } catch (error) {
    throw new Error(`Falha ao processar resposta: ${error.message}`);
  }
}
}
