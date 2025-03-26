import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as https from 'https';
import * as forge from 'node-forge';
import { parseStringPromise, Builder } from 'xml2js';
import * as crypto from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NFSE } from './nfse.entity';
import { v4 as uuidv4 } from 'uuid';
import { EmpresasService } from 'src/Login/empresas/empresas.service';
import { WebserviceService } from './webservice/webservice.service';
import { DOMParser, XMLSerializer } from 'xmldom';
import * as xmldom from 'xmldom';
import * as xmlCrypto from 'xml-crypto';
import * as xpath from 'xpath';


@Injectable()
export class NfseService {
  private readonly logger = new Logger(NfseService.name);
  private readonly nfseEndpoint = process.env.NFSE_ENDPOINT;
  private readonly DOMParser = xmldom.DOMParser;
  private readonly XMLSerializer = xmldom.XMLSerializer;

  constructor(
    private readonly httpService: HttpService,
    @Inject('NFSE_REPOSITORY')
    private readonly nfseRepository: Repository<NFSE>,
    private readonly empresasService: EmpresasService,
    private readonly webserviceService: WebserviceService,
    

    ) {}

    async enviarNfse(cnpj: string, xml: string): Promise<any> {
      try {
        // 1. Busca a empresa pelo CNPJ
        const empresa = await this.empresasService.getEmpresa(cnpj);
        
        if (empresa instanceof HttpException || !empresa?.AMBIENTE_INTEGRACAO_ID) {
          throw new Error('Empresa não encontrada ou ambiente de integração não configurado');
        }
  
        // 2. Busca o webservice pelo ID
        const webservice = await this.webserviceService.getWebservice(empresa.AMBIENTE_INTEGRACAO_ID);
        
        if (!webservice?.LINK) {
          throw new Error('Webservice não encontrado ou link não configurado');
        }
  
        // 3. Envia a NFSe
        const response = await this.httpService.post(webservice.LINK, xml, {
          headers: { 'Content-Type': 'application/xml' },
        }).toPromise();
  
        // 4. Salva o retorno (apenas status e protocolo como exemplo)
        const nfse = this.nfseRepository.create({
          CnpjPrestador: cnpj,
          Protocolo: response.data.protocolo || 'N/A',
          Status: 'ENVIADO',
          // Adicione outros campos conforme necessário
        });
        
        await this.nfseRepository.save(nfse);
  
        return response.data;
      } catch (error) {
        // Log do erro e salva no banco
        await this.nfseRepository.save({
          CnpjPrestador: cnpj,
          Status: 'ERRO',
          InformacoesComplementares: error.message
          // Adicione outros campos de erro conforme necessário
        });
        
        throw new Error(`Erro no envio da NFSe: ${error.message}`);
      }
    }
  
    private async carregarCertificado(cnpj: string): Promise<{ privateKey: string; publicCert: string }> {
      try {
        const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpj);
        
        const p12Asn1 = forge.asn1.fromDer(pfx.toString('binary'));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
  
        const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const privateKey = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
        if (!privateKey) {
          throw new Error('Chave privada não encontrada no certificado');
        }
  
        const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certificate = certBag[forge.pki.oids.certBag]?.[0]?.cert;
        if (!certificate) {
          throw new Error('Certificado público não encontrado');
        }
  
        return {
          privateKey: forge.pki.privateKeyToPem(privateKey),
          publicCert: forge.pki.certificateToPem(certificate)
        };
      } catch (error) {
        this.logger.error(`Erro ao carregar certificado: ${error.message}`);
        throw new Error(`Falha ao processar certificado digital: ${error.message}`);
      }
    }
  
    async enviarLoteRps(dados: any): Promise<any> {
      const cnpjPrestador = dados.prestador?.cnpj;
      this.logger.debug(`Iniciando envio de lote RPS para CNPJ: ${cnpjPrestador}`);
      this.logger.verbose('Dados recebidos:', JSON.stringify(dados, null, 2));
  
      try {
        if (!cnpjPrestador) {
          throw new Error('CNPJ do prestador não informado');
        }
        if (!dados.rpsList?.length) {
          throw new Error('Pelo menos um RPS deve ser informado');
        }
  
        // 1. Carregar certificado
        this.logger.debug('Carregando certificado digital...');
        const certificado = await this.carregarCertificado(cnpjPrestador);
        this.logger.debug('Certificado carregado com sucesso');
  
        // 2. Gerar XML
        this.logger.debug('Gerando XML do lote RPS...');
        const xml = this.gerarXmlLoteRps(dados);
        this.logger.verbose('XML gerado:', xml);
  
              // 3. Assinar XML
          this.logger.debug('Assinando XML...');
          const xmlAssinado = await this.assinarXml(xml, certificado.privateKey, certificado.publicCert);
          this.logger.debug('XML assinado com sucesso');
          
          // Log do XML assinado
          this.logger.log('========== XML ASSINADO ==========');
          this.logger.log(xmlAssinado.substring(0, 50000) + '...'); // Mostra apenas o início
          this.logger.log('==================================');
        
        // Salvar XML assinado em arquivo para debug (opcional)
        if (process.env.NODE_ENV === 'development') {
            const fs = require('fs');
            const path = require('path');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filePath = path.join(__dirname, `../../../logs/xml-assinado-${timestamp}.xml`);
            fs.writeFileSync(filePath, xmlAssinado);
            this.logger.debug(`XML assinado salvo em: ${filePath}`);
        }
  
        // 4. Configurar agente HTTPS
        this.logger.debug('Configurando agente HTTPS...');
        const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpjPrestador);
        const httpsAgent = new https.Agent({
          pfx,
          passphrase,
          rejectUnauthorized: false,
          secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1,
        });
  
        // 5. Obter endpoint
        this.logger.debug('Obtendo endpoint do webservice...');
        const empresa = await this.empresasService.getEmpresa(cnpjPrestador);
        if (empresa instanceof HttpException || !empresa?.AMBIENTE_INTEGRACAO_ID) {
          throw new Error('Empresa não encontrada ou ambiente de integração não configurado');
        }
  
        const webservice = await this.webserviceService.getWebservice(empresa.AMBIENTE_INTEGRACAO_ID);
        if (!webservice?.LINK) {
          throw new Error('Webservice não encontrado ou link não configurado');
        }
        this.logger.debug(`Endpoint obtido: ${webservice.LINK}`);
  
        // 6. Enviar para o webservice
        this.logger.debug('Enviando lote para o webservice...');
        const response = await this.httpService.post(
          webservice.LINK,
          xmlAssinado,
          {
            headers: {
              'Content-Type': 'text/xml;charset=utf-8',
              'SOAPAction': 'http://nfse.abrasf.org.br/RecepcionarLoteRps',
            },
            httpsAgent,
            timeout: 30000,
          }
        ).toPromise();
        this.logger.debug('Resposta do webservice recebida');
        this.logger.verbose('Resposta completa:', JSON.stringify(response.data, null, 2));
  
        // 7. Processar resposta
        this.logger.debug('Processando resposta...');
        const protocolo = this.extrairProtocolo(response.data);
        if (!protocolo) {
          throw new Error('Não foi possível obter o protocolo da resposta');
        }
        this.logger.debug(`Protocolo obtido: ${protocolo}`);
  
        // 8. Salvar no banco
        this.logger.debug('Salvando dados da NFSe no banco...');
        const nfse = await this.salvarNfse(dados, protocolo);
        this.logger.debug(`NFSe salva com ID: ${nfse.id}`);
  
        return {
          success: true,
          protocolo,
          numeroLote: dados.lote?.numeroLote,
          dataEnvio: new Date().toISOString(),
          nfseId: nfse.id,
        };
  
      } catch (error) {
        this.logger.error('Erro no envio do lote RPS:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data,
        });
  
        await this.registrarFalha(cnpjPrestador, error.message, dados);
  
        throw {
          success: false,
          error: 'Falha no envio do lote RPS',
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        };
      }
    }
  
    private async registrarFalha(cnpj: string, erro: string, dados: any): Promise<void> {
      try {
        this.logger.error(`Registrando falha para CNPJ ${cnpj}: ${erro}`);
        
        await this.nfseRepository.save({
          CnpjPrestador: cnpj,
          Status: 'ERRO',
          Erro: erro.substring(0, 500),
          DadosEnvio: JSON.stringify(dados),
          DataEmissao: new Date(),
        });
  
        this.logger.debug('Falha registrada no banco de dados');
      } catch (dbError) {
        this.logger.error('Falha ao registrar erro no banco de dados:', {
          message: dbError.message,
          stack: dbError.stack,
        });
      }
    }


  private gerarXmlLoteRps(dados: any): string {
    return `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://nfse.abrasf.org.br">
        <soap:Body>
          <svc:RecepcionarLoteRps>
            <nfseCabecMsg>
              <cabecalho versao="2.04">
                <versaoDados>2.04</versaoDados>
              </cabecalho>
            </nfseCabecMsg>
            <nfseDadosMsg>
              ${this.gerarXmlEnvioLote(dados)}
            </nfseDadosMsg>
          </svc:RecepcionarLoteRps>
        </soap:Body>
      </soap:Envelope>
    `.trim();
  }

  private gerarXmlEnvioLote(dados: any): string {
    return `
      <EnviarLoteRpsEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
        <LoteRps versao="2.04">
          <NumeroLote>${dados.lote.numeroLote}</NumeroLote>
          <Prestador>
            <CpfCnpj>
              ${dados.prestador.cnpj ? `<Cnpj>${dados.prestador.cnpj}</Cnpj>` : ''}
              ${dados.prestador.cpf ? `<Cpf>${dados.prestador.cpf}</Cpf>` : ''}
            </CpfCnpj>
            <InscricaoMunicipal>${dados.prestador.inscricaoMunicipal}</InscricaoMunicipal>
          </Prestador>
          <QuantidadeRps>${dados.lote.quantidadeRps}</QuantidadeRps>
          <ListaRps>
            ${dados.rpsList.map(rps => this.gerarXmlRps(rps, dados.prestador)).join('')}
          </ListaRps>
        </LoteRps>
      </EnviarLoteRpsEnvio>
    `.trim();
}

private gerarXmlRps(rps: any, prestadorLote: any): string {
    // Usa o prestador do RPS se existir, senão usa o prestador do lote
    const prestador = rps.prestador || prestadorLote || {};
    const tomador = rps.tomador || {};
    const tomadorIdentificacao = tomador.identificacao || {};
    const tomadorEndereco = tomador.endereco || {};
    const servico = rps.servico || {};
    const valores = servico.valores || {};
  
    return `
      <Rps>
        <InfDeclaracaoPrestacaoServico>
          <Rps>
            <IdentificacaoRps>
              <Numero>${rps.identificacao?.numero || ''}</Numero>
              <Serie>${rps.identificacao?.serie || '1'}</Serie>
              <Tipo>${rps.identificacao?.tipo || '1'}</Tipo>
            </IdentificacaoRps>
            <DataEmissao>${rps.dataEmissao || new Date().toISOString()}</DataEmissao>
            <Status>${rps.status || '1'}</Status>
          </Rps>
          <Competencia>${rps.competencia || new Date().toISOString().split('T')[0]}</Competencia>
          <Servico>
            <Valores>
              <ValorServicos>${valores.valorServicos || '0.00'}</ValorServicos>
              ${valores.valorDeducoes ? `<ValorDeducoes>${valores.valorDeducoes}</ValorDeducoes>` : ''}
              <ValorIss>${valores.valorIss || '0.00'}</ValorIss>
            </Valores>
            <IssRetido>${servico.issRetido || '2'}</IssRetido>
            <ItemListaServico>${servico.itemListaServico || ''}</ItemListaServico>
            <CodigoCnae>${servico.codigoCnae || ''}</CodigoCnae>
            <CodigoTributacaoMunicipio>${servico.codigoTributacaoMunicipio || ''}</CodigoTributacaoMunicipio>
            <Discriminacao>${servico.discriminacao || ''}</Discriminacao>
            <CodigoMunicipio>${servico.codigoMunicipio || ''}</CodigoMunicipio>
            <ExigibilidadeISS>${servico.exigibilidadeISS || ''}</ExigibilidadeISS>
            <MunicipioIncidencia>${servico.municipioIncidencia || ''}</MunicipioIncidencia>
          </Servico>
          <Prestador>
            <CpfCnpj>
              ${prestador.cnpj ? `<Cnpj>${prestador.cnpj}</Cnpj>` : ''}
              ${prestador.cpf ? `<Cpf>${prestador.cpf}</Cpf>` : ''}
            </CpfCnpj>
            <InscricaoMunicipal>${prestador.inscricaoMunicipal || ''}</InscricaoMunicipal>
          </Prestador>
          <TomadorServico>
            <IdentificacaoTomador>
              <CpfCnpj>
                ${tomadorIdentificacao.cnpj ? `<Cnpj>${tomadorIdentificacao.cnpj}</Cnpj>` : ''}
                ${tomadorIdentificacao.cpf ? `<Cpf>${tomadorIdentificacao.cpf}</Cpf>` : ''}
              </CpfCnpj>
            </IdentificacaoTomador>
            <RazaoSocial>${tomador.razaoSocial || ''}</RazaoSocial>
            <Endereco>
              <Endereco>${tomadorEndereco.endereco || ''}</Endereco>
              <Numero>${tomadorEndereco.numero || ''}</Numero>
              ${tomadorEndereco.complemento ? `<Complemento>${tomadorEndereco.complemento}</Complemento>` : ''}
              <Bairro>${tomadorEndereco.bairro || ''}</Bairro>
              <CodigoMunicipio>${tomadorEndereco.codigoMunicipio || ''}</CodigoMunicipio>
              <Uf>${tomadorEndereco.uf || ''}</Uf>
              <Cep>${tomadorEndereco.cep || ''}</Cep>
            </Endereco>
          </TomadorServico>
          <OptanteSimplesNacional>${rps.optanteSimplesNacional || '2'}</OptanteSimplesNacional>
          <IncentivoFiscal>${rps.incentivoFiscal || '2'}</IncentivoFiscal>
        </InfDeclaracaoPrestacaoServico>
      </Rps>
    `.trim();
}
  
  private extractCNPJFromCert(cert: forge.pki.Certificate): string | null {
    const attrs = cert.subject.attributes;
    const oid = '2.16.76.1.3.3'; // OID para CNPJ em certificados digitais brasileiros
    const cnpjAttr = attrs.find(attr => attr.type === oid);
    return cnpjAttr?.value || null;
  }

  private async assinarXml(xml: string, privateKey: string, publicCert: string): Promise<string> {
    try {
        const xmlDoc = new this.DOMParser().parseFromString(xml, "text/xml");
        
        // 1. Assinar cada RPS (assinatura interna)
        const rpsList = xmlDoc.getElementsByTagName("Rps");
        for (let i = 0; i < rpsList.length; i++) {
            const rps = rpsList[i];
            const infDeclaracao = rps.getElementsByTagName("InfDeclaracaoPrestacaoServico")[0];
            
            // Verificar se já existe uma assinatura
            if (rps.getElementsByTagName("Signature").length > 0) {
                continue;
            }
            
            // Criar assinatura para o RPS
            const signature = this.criarAssinaturaRps(infDeclaracao, privateKey, publicCert);
            rps.appendChild(signature);
        }
        
        // 2. Assinar o LoteRps (assinatura externa - CORREÇÃO)
        const enviarLote = xmlDoc.getElementsByTagName("EnviarLoteRpsEnvio")[0];
        const loteRps = xmlDoc.getElementsByTagName("LoteRps")[0];
        
        // Remover assinatura existente se houver
        const existingSignatures = enviarLote.getElementsByTagName("Signature");
        for (let i = 0; i < existingSignatures.length; i++) {
            enviarLote.removeChild(existingSignatures[i]);
        }
        
        // Criar nova assinatura no local correto (após LoteRps)
        const signatureLote = this.criarAssinaturaLote(loteRps, privateKey, publicCert);
        
        // Inserir a assinatura após o LoteRps
        enviarLote.insertBefore(signatureLote, loteRps.nextSibling);
        
        return new this.XMLSerializer().serializeToString(xmlDoc);
    } catch (error) {
        throw new Error(`Falha na assinatura do XML: ${error.message}`);
    }
}

  private criarAssinaturaRps(nodeToSign: any, privateKey: string, publicCert: string): Node {
    // Canonicalizar o nó
    const canonicalXml = this.canonicalizeXml(nodeToSign);
    
    // Calcular DigestValue
    const digest = crypto.createHash('sha1').update(canonicalXml).digest('base64');
    
    // Assinar o DigestValue
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(canonicalXml);
    const signatureValue = sign.sign(privateKey, 'base64');
    
    // Certificado em Base64
    const x509Certificate = publicCert
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

  private criarAssinaturaLote(nodeToSign: any, privateKey: string, publicCert: string): Node {
    // Canonicalizar o nó
    const canonicalXml = this.canonicalizeXml(nodeToSign);
    
    // Calcular DigestValue
    const digest = crypto.createHash('sha1').update(canonicalXml).digest('base64');
    
    // Assinar o DigestValue
    const sign = crypto.createSign('RSA-SHA1');
    sign.update(canonicalXml);
    const signatureValue = sign.sign(privateKey, 'base64');
    
    // Certificado em Base64
    const x509Certificate = publicCert
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
    // Implementação simplificada de canonicalização
    // Para produção, considere usar uma biblioteca específica como 'xml-c14n'
    const serializer = new this.XMLSerializer();
    let xml = serializer.serializeToString(node);
    
    // Remover espaços em branco desnecessários
    xml = xml.replace(/>\s+</g, '><');
    xml = xml.replace(/\s+/g, ' ');
    xml = xml.trim();
    
    return xml;
  }

  private async enviarParaWebService(xml: string): Promise<string> {
    const httpsAgent = new https.Agent({
      pfx: fs.readFileSync(process.env.CERTIFICADO_PATH),
      passphrase: process.env.CERTIFICADO_PASSPHRASE,
      rejectUnauthorized: false,
    });

    try {
      const response = await this.httpService.post(
        this.nfseEndpoint,
        xml,
        {
          headers: {
            'Content-Type': 'text/xml;charset=utf-8',
            'SOAPAction': 'http://nfse.abrasf.org.br/RecepcionarLoteRps',
          },
          httpsAgent,
        }
      ).toPromise();

      return response.data;
    } catch (error) {
      this.logger.error('Erro no WebService', {
        response: error.response?.data,
        message: error.message,
      });
      throw new Error('Falha na comunicação com o WebService');
    }
  }

  private extrairProtocolo(xmlResposta: string): string | null {
    const match = xmlResposta.match(/<Protocolo>([^<]+)<\/Protocolo>/);
    return match ? match[1] : null;
  }

  private async salvarNfse(dados: any, protocolo: string): Promise<NFSE> {
    const rps = dados.rpsList?.[0] || {};
    const servico = rps.servico || {};
    const valores = servico.valores || {};
    const tomador = rps.tomador || {};
    const endereco = tomador.endereco || {};

    const nfse = this.nfseRepository.create({
      NumeroLote: dados.lote?.numeroLote,
      CnpjPrestador: dados.prestador?.cnpj,
      InscricaoMunicipalPrestador: dados.prestador?.inscricaoMunicipal,
      QuantidadeRps: dados.rpsList?.length,
      NumeroRps: rps.identificacao?.numero,
      SerieRps: rps.identificacao?.serie || '1',
      TipoRps: rps.identificacao?.tipo || 1,
      DataEmissaoRps: new Date().toISOString(),
      Competencia: rps.competencia || new Date().toISOString().split('T')[0],
      ValorServicos: valores.valorServicos || 0,
      ValorIss: valores.valorIss || 0,
      ItemListaServico: servico.itemListaServico,
      CodigoCnae: servico.codigoCnae,
      Discriminacao: servico.discriminacao,
      CodigoMunicipio: servico.codigoMunicipio,
      CnpjTomador: tomador.identificacao?.cnpj,
      RazaoSocialTomador: tomador.razaoSocial,
      EnderecoTomador: endereco.endereco,
      NumeroEnderecoTomador: endereco.numero,
      ComplementoEnderecoTomador: endereco.complemento,
      BairroTomador: endereco.bairro,
      CodigoMunicipioTomador: endereco.codigoMunicipio,
      UfTomador: endereco.uf,
      CepTomador: endereco.cep,
      OptanteSimplesNacional: rps.optanteSimplesNacional === '1' ? 1 : 2,
      IncentivoFiscal: rps.incentivoFiscal === '1' ? 1 : 2,
      Protocolo: protocolo,
      Status: 'PROCESSANDO',
    });

    return this.nfseRepository.save(nfse);
  }
  
  async consultarSituacaoLote(protocolo: string, prestador: any): Promise<any> {
    const xml = `
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:svc="http://nfse.abrasf.org.br">
        <soap:Body>
          <svc:ConsultarSituacaoLoteRps>
            <Prestador>
              <CpfCnpj>
                ${prestador.cnpj ? `<Cnpj>${prestador.cnpj}</Cnpj>` : ''}
                ${prestador.cpf ? `<Cpf>${prestador.cpf}</Cpf>` : ''}
              </CpfCnpj>
              <InscricaoMunicipal>${prestador.inscricaoMunicipal}</InscricaoMunicipal>
            </Prestador>
            <Protocolo>${protocolo}</Protocolo>
          </svc:ConsultarSituacaoLoteRps>
        </soap:Body>
      </soap:Envelope>
    `.trim();

    const resposta = await this.enviarParaWebService(xml);
    await this.atualizarStatusNfse(protocolo, resposta);
    return resposta;
  }

  private async atualizarStatusNfse(protocolo: string, resposta: any): Promise<void> {
    const status = this.extrairStatusResposta(resposta);
    if (status) {
      await this.nfseRepository.update(
        { Protocolo: protocolo } as any, // Usando 'as any' temporariamente ou defina o tipo correto
        { Status: status }
      );
    }
  }

  private extrairStatusResposta(xmlResposta: string): string {
    const match = xmlResposta.match(/<Situacao>([^<]+)<\/Situacao>/);
    return match ? match[1] : 'DESCONHECIDO';
  }
}