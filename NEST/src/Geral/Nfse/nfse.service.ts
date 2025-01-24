import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as https from 'https';
import * as forge from 'node-forge';
import { XmlUtilsService } from './common/xml-utils.service';
import { EmailService } from './common/email.service';
import { parseStringPromise, Builder } from 'xml2js';
import * as crypto from 'crypto';

@Injectable()
export class NfseService {
  private readonly nfseEndpoint = 'https://www.issnetonline.com.br/homologaabrasf/webservicenfse204/nfse.asmx';

  constructor(
    private readonly httpService: HttpService,
    private readonly xmlUtils: XmlUtilsService,
    private readonly emailService: EmailService,
  ) {}

  async enviarLoteRps(dados: any): Promise<any> {
    const xml = await this.xmlUtils.gerarXml('enviar-lote-rps', dados);
    console.log('XML Gerado:', xml);

    const pfx = fs.readFileSync('certificado.pfx');
    const passphrase = 'minha_senha';
    const p12Asn1 = forge.asn1.fromDer(pfx.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });

    if (!keyBag || Object.keys(keyBag).length === 0) {
      throw new Error('Chave privada não encontrada no certificado PFX.');
    }
    if (!certBag || Object.keys(certBag).length === 0) {
      throw new Error('Certificado público não encontrado no certificado PFX.');
    }

    const privateKey = forge.pki.privateKeyToPem(keyBag[Object.keys(keyBag)[0]][0].key);
    const publicCert = forge.pki.certificateToPem(certBag[Object.keys(certBag)[0]][0].cert);

    const xmlAssinado = await this.assinarXml(xml, privateKey, publicCert);
    console.log('XML Assinado:', xmlAssinado);

    const httpsAgent = new https.Agent({
      pfx,
      passphrase,
      minVersion: 'TLSv1.2',
    });

    try {
      const response = await this.httpService
        .post(this.nfseEndpoint, xmlAssinado, {
          headers: {
            'Content-Type': 'text/xml;charset=utf-8',
            'SOAPAction': 'http://nfse.abrasf.org.br/RecepcionarLoteRps',
          },
          httpsAgent,
        })
        .toPromise();

      console.log('Resposta do Servidor:', response.data);

      // Extrair o número do protocolo
      const protocolo = await this.extrairProtocolo(response.data);

      // Realizar a consulta pelo protocolo
      if (protocolo) {
        const consultaResposta = await this.consultarProtocolo(dados.cnpj, dados.inscricaoMunicipal, protocolo);
        console.log('Resposta da consulta pelo protocolo:', consultaResposta);
      }

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar a requisição:', error.response?.data || error.message);
      throw error;
    }
  }

  private async extrairProtocolo(xmlResposta: string): Promise<string | null> {
    try {
      const parsed = await parseStringPromise(xmlResposta, { explicitArray: false });
      const protocolo = parsed['s:Envelope']['s:Body']['RecepcionarLoteRpsResponse']['EnviarLoteRpsResposta']['Protocolo'];
      console.log('Protocolo extraído:', protocolo);
      return protocolo || null;
    } catch (error) {
      console.error('Erro ao extrair o protocolo:', error.message);
      return null;
    }
  }

  async consultarProtocolo(cnpj: string, inscricaoMunicipal: string, protocolo: string): Promise<any> {
    const xmlConsulta = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://nfse.abrasf.org.br">
        <soap:Body>
          <svc:ConsultarSituacaoLoteRps>
            <Prestador>
              <CpfCnpj>
                <Cnpj>${cnpj}</Cnpj>
              </CpfCnpj>
              <InscricaoMunicipal>${inscricaoMunicipal}</InscricaoMunicipal>
            </Prestador>
            <Protocolo>${protocolo}</Protocolo>
          </svc:ConsultarSituacaoLoteRps>
        </soap:Body>
      </soap:Envelope>
    `.trim();

    console.log('XML de Consulta de Protocolo:', xmlConsulta);

    const pfx = fs.readFileSync('certificado.pfx');
    const passphrase = 'minha_senha';

    const httpsAgent = new https.Agent({
      pfx,
      passphrase,
      minVersion: 'TLSv1.2',
    });

    try {
      const response = await this.httpService
        .post(this.nfseEndpoint, xmlConsulta, {
          headers: {
            'Content-Type': 'text/xml;charset=utf-8',
            'SOAPAction': 'http://nfse.abrasf.org.br/ConsultarSituacaoLoteRps',
          },
          httpsAgent,
        })
        .toPromise();

      console.log('Resposta da Consulta de Protocolo:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erro na consulta pelo protocolo:', error.response?.data || error.message);
      throw error;
    }
  }

  private async assinarXml(xml: string, privateKey: string, publicCert: string): Promise<string> {
    const xmlParsed = await parseStringPromise(xml);

    // Processar cada <Rps>
    const listaRps = xmlParsed['soap:Envelope']['soap:Body'][0]['svc:RecepcionarLoteRps'][0]['nfseDadosMsg'][0]['EnviarLoteRpsEnvio'][0]['LoteRps'][0]['ListaRps'][0]['Rps'];

    listaRps.forEach((rps: any) => {
        const infDeclaracaoTag = rps['InfDeclaracaoPrestacaoServico'][0];

        // Verificar se já existe uma tag <Signature> neste RPS
        if (rps['Signature']) {
            console.warn('A tag <Signature> já existe neste RPS. Ignorando adição.');
            return;
        }

        // Canonicalizar <InfDeclaracaoPrestacaoServico>
        const canonicalXml = this.canonicalizeXml(infDeclaracaoTag);

        // Calcular DigestValue
        const digest = crypto.createHash('sha1').update(canonicalXml).digest('base64');

        // Assinar o DigestValue
        const sign = crypto.createSign('RSA-SHA1');
        sign.update(canonicalXml);
        const signatureValue = sign.sign(privateKey, 'base64');

        // Certificado em Base64
        const x509Certificate = publicCert.replace(/(-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n|\r)/g, '');

        // Construir a estrutura da assinatura
        rps['Signature'] = [{
            $: { xmlns: 'http://www.w3.org/2000/09/xmldsig#' },
            SignedInfo: [{
                CanonicalizationMethod: [{
                    $: { Algorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315' },
                }],
                SignatureMethod: [{
                    $: { Algorithm: 'http://www.w3.org/2000/09/xmldsig#rsa-sha1' },
                }],
                Reference: [{
                    Transforms: [{
                        Transform: [
                            { $: { Algorithm: 'http://www.w3.org/2000/09/xmldsig#enveloped-signature' } },
                            { $: { Algorithm: 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315' } },
                        ],
                    }],
                    DigestMethod: [{ $: { Algorithm: 'http://www.w3.org/2000/09/xmldsig#sha1' } }],
                    DigestValue: [digest],
                }],
            }],
            SignatureValue: [signatureValue],
            KeyInfo: [{
                X509Data: [{
                    X509Certificate: [x509Certificate],
                }],
            }],
        }];
    });

    // Gerar assinatura global para o <LoteRps>
    const loteRpsTag = xmlParsed['soap:Envelope']['soap:Body'][0]['svc:RecepcionarLoteRps'][0]['nfseDadosMsg'][0]['EnviarLoteRpsEnvio'][0]['LoteRps'][0];

    let loteAssinaturaXml = '';
    if (!loteRpsTag['Signature']) {
        const canonicalLoteXml = this.canonicalizeXml(loteRpsTag);

        const loteDigest = crypto.createHash('sha1').update(canonicalLoteXml).digest('base64');
        const loteSign = crypto.createSign('RSA-SHA1');
        loteSign.update(canonicalLoteXml);
        const loteSignatureValue = loteSign.sign(privateKey, 'base64');

        const x509Certificate = publicCert.replace(/(-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\n|\r)/g, '');

        // Construir a estrutura da assinatura global como string
        loteAssinaturaXml = `
          <Signature xmlns="http://www.w3.org/2000/09/xmldsig#">
            <SignedInfo>
              <CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
              <SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1" />
              <Reference>
                <Transforms>
                  <Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature" />
                  <Transform Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315" />
                </Transforms>
                <DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1" />
                <DigestValue>${loteDigest}</DigestValue>
              </Reference>
            </SignedInfo>
            <SignatureValue>${loteSignatureValue}</SignatureValue>
            <KeyInfo>
              <X509Data>
                <X509Certificate>${x509Certificate}</X509Certificate>
              </X509Data>
            </KeyInfo>
          </Signature>
        `.trim();
    } else {
        console.warn('Tag <Signature> já existe no <LoteRps>. Ignorando adição.');
    }

    // Reconstruir o XML
    const builder = new Builder({ headless: true, renderOpts: { pretty: false } });
    let xmlAssinado = builder.buildObject(xmlParsed);

    // Adicionar a assinatura global após </LoteRps>
    if (loteAssinaturaXml) {
        xmlAssinado = xmlAssinado.replace(
            '</LoteRps>',
            `</LoteRps>${loteAssinaturaXml}`
        );
    }

    return xmlAssinado
      .replace(/&#xD;/g, '') // Remover quebras de linha desnecessárias
      .replace(/&(lt|gt|amp);/g, match => {
        if (match === '&lt;') return '<';
        if (match === '&gt;') return '>';
        if (match === '&amp;') return '&';
        return match;
      });
}



private canonicalizeXml(xmlObject: any): string {
    const builder = new Builder({ headless: true, renderOpts: { pretty: false } });
    return builder.buildObject(xmlObject)
        .replace(/\r?\n|\r/g, '') // Remover quebras de linha
        .trim(); // Remover espaços em branco desnecessários
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
