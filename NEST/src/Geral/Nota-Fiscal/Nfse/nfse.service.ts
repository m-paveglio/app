import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as https from 'https';
import * as forge from 'node-forge';
import { parseStringPromise } from 'xml2js';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { NFSE } from './nfse.entity';
import { EmpresasService } from 'src/Login/empresas/empresas.service';
import { WebserviceService } from './webservice/webservice.service';
import * as xmldom from 'xmldom';
import { RpsService } from './RpsDisponivel/rps.service';

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
 


async gerarNfse(dados: any): Promise<any> {
  const cnpjPrestador = dados.prestador?.cnpj;
  this.logger.debug(`Iniciando envio de lote RPS para CNPJ: ${cnpjPrestador}`);
  this.logger.verbose('Dados recebidos:', JSON.stringify(dados, null, 2));

  try {
      if (!cnpjPrestador) {
          throw new Error('CNPJ do prestador não informado');
      }

      // 1. Verificar e buscar RPS disponível se necessário
      if (!dados.rpsList?.length || !dados.rpsList[0]?.identificacao?.numero) {
          
          const rpsService = new RpsService(
              this.httpService,
              this.empresasService,
              this.webserviceService
          );

          if (!dados.rpsList?.[0]?.identificacao?.serie) {
              // Verifica se está usando a estrutura antiga (dados diretos)
              if (dados.identificacao?.serie) {
                  // Migra para a nova estrutura
                  dados.rpsList = [{
                      identificacao: {
                          serie: dados.identificacao.serie,
                          tipo: dados.identificacao.tipo
                      },
                      dataEmissao: dados.dataEmissao,
                      status: dados.status,
                      // ... outros campos
                  }];
              } else {
                  throw new Error('Série do RPS não informada. Este campo é obrigatório');
              }
          }
          
          if (!dados.rpsList?.length || !dados.rpsList[0]?.identificacao?.numero) {
            const primeiroRps = await rpsService.buscarPrimeiroRpsDisponivel(cnpjPrestador);
          
            const rpsBase = dados.rpsList?.[0] || {};
            
            const novoRps = {
              ...rpsBase,
              identificacao: {
                ...rpsBase.identificacao,
                numero: primeiroRps
              }
            };
          
            dados.rpsList = [novoRps];
            dados.rps = novoRps; // <- isso resolve seu problema
          }
      }

      // DEBUG: Verificar os dados antes de gerar o XML
      this.logger.debug('Dados do RPS que será enviado:', JSON.stringify(dados.rpsList, null, 2));

      // 2. Carregar certificado
      this.logger.debug('Carregando certificado digital...');
      const certificado = await this.carregarCertificado(cnpjPrestador);
      this.logger.debug('Certificado carregado com sucesso');

      // Restante do método continua igual...
      // 3. Gerar XML
      this.logger.debug('Gerando XML do lote RPS...');
      const xml = this.gerarXmlNfse(dados);
      this.logger.verbose('XML gerado:', xml);
  
              // 3. Assinar XML
          this.logger.debug('Assinando XML...');
          const xmlAssinado = await this.assinarXmlNfse(xml, certificado.privateKey, certificado.publicCert);
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
this.logger.debug('Enviando NFSE para o webservice...');
this.logger.verbose('XML a ser enviado à prefeitura:', xmlAssinado); // 👈 Adicionado aqui
const response = await this.httpService.post(
    webservice.LINK,
    xmlAssinado,
    {
        headers: {
            'Content-Type': 'text/xml;charset=utf-8',
            'SOAPAction': 'http://nfse.abrasf.org.br/GerarNfse',
        },
        httpsAgent,
        timeout: 30000,
    }
).toPromise();

this.logger.verbose('Resposta XML bruta da prefeitura:', response.data);

const erros = this.extrairMensagensErro(response.data);
if (erros.length) {
  this.logger.error('Erros retornados pela prefeitura:\n' + erros.join('\n\n'));
}
    
        
    
  
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

private extrairMensagensErro(xml: string): string[] {
  const mensagens: string[] = [];

  const regexMensagem = /<Mensagem>(.*?)<\/Mensagem>/g;
  const regexCorrecao = /<Correcao>(.*?)<\/Correcao>/g;

  const mensagensMatch = [...xml.matchAll(regexMensagem)];
  const correcaoMatch = [...xml.matchAll(regexCorrecao)];

  for (let i = 0; i < mensagensMatch.length; i++) {
    const msg = mensagensMatch[i]?.[1] || '';
    const correcao = correcaoMatch[i]?.[1] || '';
    mensagens.push(`❌ ${msg}\n   ➤ Correção: ${correcao}`);
  }

  return mensagens;
}

private gerarXmlNfse(dados: any): string {
  const rps = dados.rps || {};
  const prestador = rps.prestador || dados.prestador || {};
  const tomador = rps.tomador || {};
  const servico = rps.servico || {};
  const valores = servico.valores || {};

  return `
    <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://nfse.abrasf.org.br">
      <soapenv:Body>
        <nfse:GerarNfse>
          <nfseCabecMsg>
            <cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.04">
              <versaoDados>2.04</versaoDados>
            </cabecalho>
          </nfseCabecMsg>
          <nfseDadosMsg>
            <GerarNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
              ${this.gerarXmlRpsIndividual(rps, prestador)}
            </GerarNfseEnvio>
          </nfseDadosMsg>
        </nfse:GerarNfse>
      </soapenv:Body>
    </soapenv:Envelope>
  `.trim();
}

private gerarXmlRpsIndividual(rps: any, prestadorLote: any): string {
  const prestador = rps.prestador || prestadorLote || {};
  const tomador = rps.tomador || {};
  const tomadorIdentificacao = tomador.identificacao || {};
  const tomadorEndereco = tomador.endereco || {};
  const servico = rps.servico || {};
  const valores = servico.valores || {};
  const serieRps = rps.identificacao?.serie || '1';

  if (!rps.identificacao?.numero) {
    throw new Error('Número do RPS não informado');
  }

  let xml = `
    <Rps>
      <InfDeclaracaoPrestacaoServico>
        <Rps>
          <IdentificacaoRps>
            <Numero>${rps.identificacao?.numero}</Numero>
            <Serie>${serieRps}</Serie>
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
            ${valores.valorPis ? `<ValorPis>${valores.valorPis}</ValorPis>` : ''}
            ${valores.valorCofins ? `<ValorCofins>${valores.valorCofins}</ValorCofins>` : ''}
            ${valores.valorInss ? `<ValorInss>${valores.valorInss}</ValorInss>` : ''}
            ${valores.valorIr ? `<ValorIr>${valores.valorIr}</ValorIr>` : ''}
            ${valores.valorCsll ? `<ValorCsll>${valores.valorCsll}</ValorCsll>` : ''}
            ${valores.outrasRetencoes ? `<OutrasRetencoes>${valores.outrasRetencoes}</OutrasRetencoes>` : ''}
            ${valores.valTotTributos ? `<ValTotTributos>${valores.valTotTributos}</ValTotTributos>` : ''}
            ${valores.valorIss ? `<ValorIss>${valores.valorIss}</ValorIss>` : ''}
            ${valores.aliquota ? `<Aliquota>${valores.aliquota}</Aliquota>` : ''}
          </Valores>
          <IssRetido>${servico.issRetido || '2'}</IssRetido>
          ${servico.responsavelRetencao ? `<ResponsavelRetencao>${servico.responsavelRetencao}</ResponsavelRetencao>` : ''}
          <ItemListaServico>${servico.itemListaServico || ''}</ItemListaServico>
          <CodigoCnae>${servico.codigoCnae || ''}</CodigoCnae>
          <CodigoTributacaoMunicipio>${servico.codigoTributacaoMunicipio || ''}</CodigoTributacaoMunicipio>
          ${valores.codigoNbs ? `<CodigoNbs>${valores.codigoNbs}</CodigoNbs>` : ''}
          <Discriminacao>${servico.discriminacao || ''}</Discriminacao>
          <CodigoMunicipio>${servico.codigoMunicipio || ''}</CodigoMunicipio>
          <ExigibilidadeISS>${servico.exigibilidadeISS || '1'}</ExigibilidadeISS>
          <MunicipioIncidencia>${servico.municipioIncidencia || servico.codigoMunicipio || ''}</MunicipioIncidencia>
        </Servico>
        <Prestador>
          <CpfCnpj>
            ${prestador.cnpj ? `<Cnpj>${prestador.cnpj}</Cnpj>` : ''}
            ${prestador.cpf ? `<Cpf>${prestador.cpf}</Cpf>` : ''}
          </CpfCnpj>
          <InscricaoMunicipal>${prestador.inscricaoMunicipal || ''}</InscricaoMunicipal>
        </Prestador>
        <TomadorServico>
          ${tomador.nifTomador ? `<NifTomador>${tomador.nifTomador}</NifTomador>` : ''}
         
          ${tomadorIdentificacao.cnpj || tomadorIdentificacao.cpf ? `
          <IdentificacaoTomador>
            <CpfCnpj>
              ${tomadorIdentificacao.cnpj ? `<Cnpj>${tomadorIdentificacao.cnpj}</Cnpj>` : ''}
              ${tomadorIdentificacao.cpf ? `<Cpf>${tomadorIdentificacao.cpf}</Cpf>` : ''}
            </CpfCnpj>
            ${tomadorIdentificacao.inscricaoMunicipal ? `<InscricaoMunicipal>${tomadorIdentificacao.inscricaoMunicipal}</InscricaoMunicipal>` : ''}
          </IdentificacaoTomador>
             ${tomador.razaoSocial ? `<RazaoSocial>${tomador.razaoSocial}</RazaoSocial>` : ''}
          ` : ''}
          
          ${tomadorEndereco.endereco || tomadorEndereco.numero ? `
          <Endereco>
            ${tomadorEndereco.endereco ? `<Endereco>${tomadorEndereco.endereco}</Endereco>` : ''}
            ${tomadorEndereco.numero ? `<Numero>${tomadorEndereco.numero}</Numero>` : ''}
            ${tomadorEndereco.complemento ? `<Complemento>${tomadorEndereco.complemento}</Complemento>` : ''}
            ${tomadorEndereco.bairro ? `<Bairro>${tomadorEndereco.bairro}</Bairro>` : ''}
            ${tomadorEndereco.codigoMunicipio ? `<CodigoMunicipio>${tomadorEndereco.codigoMunicipio}</CodigoMunicipio>` : ''}
            ${tomadorEndereco.uf ? `<Uf>${tomadorEndereco.uf}</Uf>` : ''}
            ${tomadorEndereco.cep ? `<Cep>${tomadorEndereco.cep}</Cep>` : ''}
          </Endereco>
          ` : ''}
          
          ${tomador.contato?.telefone || tomador.contato?.email ? `
          <Contato>
            ${tomador.contato.telefone ? `<Telefone>${tomador.contato.telefone}</Telefone>` : ''}
            ${tomador.contato.email ? `<Email>${tomador.contato.email}</Email>` : ''}
          </Contato>
          ` : ''}
        </TomadorServico>
        <OptanteSimplesNacional>${rps.optanteSimplesNacional || '2'}</OptanteSimplesNacional>
        <IncentivoFiscal>${rps.incentivoFiscal || '2'}</IncentivoFiscal>
        ${rps.informacoesComplementares ? `<InformacoesComplementares>${rps.informacoesComplementares}</InformacoesComplementares>` : ''}
      </InfDeclaracaoPrestacaoServico>
    </Rps>
  `;

  // Remove linhas vazias
  return xml.split('\n').filter(line => line.trim() !== '').join('\n');
}

private async assinarXmlNfse(xml: string, privateKey: string, publicCert: string): Promise<string> {
  try {
    const xmlDoc = new this.DOMParser().parseFromString(xml, "text/xml");
    
    // Assinar o RPS
    const rps = xmlDoc.getElementsByTagName("Rps")[0];
    const infDeclaracao = rps.getElementsByTagName("InfDeclaracaoPrestacaoServico")[0];
    
    // Remover assinatura existente se houver
    const existingSignatures = rps.getElementsByTagName("Signature");
    for (let i = 0; i < existingSignatures.length; i++) {
      rps.removeChild(existingSignatures[i]);
    }
    
    // Criar nova assinatura
    const signature = this.criarAssinaturaRps(infDeclaracao, privateKey, publicCert);
    rps.appendChild(signature);
    
    return new this.XMLSerializer().serializeToString(xmlDoc);
  } catch (error) {
    throw new Error(`Falha na assinatura do XML: ${error.message}`);
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

async obterXmlResposta(protocolo: string): Promise<string | null> {
  const nfse = await this.nfseRepository.findOne({ 
      where: { Protocolo: protocolo },
      select: ['XmlResposta']
  });
  
  return nfse?.XmlResposta || null;
}

async getNFSECnpj (CnpjPrestador: string){
  const ServicoFound = await this.nfseRepository.find({
    where:{
      CnpjPrestador,
    }
  })

  if (!ServicoFound){
  return new HttpException('NFSE não encontrada', HttpStatus.NOT_FOUND)
  }
  return ServicoFound
}
}