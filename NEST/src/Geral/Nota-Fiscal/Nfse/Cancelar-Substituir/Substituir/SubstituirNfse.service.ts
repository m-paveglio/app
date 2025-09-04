import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as https from 'https';
import * as crypto from 'crypto';
import * as forge from 'node-forge';
import * as xmldom from 'xmldom';
import { EmpresasService } from 'src/Login/empresas/empresas.service';
import { WebserviceService } from '../../Consultas/webservice/webservice.service';
import { parseStringPromise } from 'xml2js';

@Injectable()
export class SubstituirNfseService {
  private readonly logger = new Logger(SubstituirNfseService.name);
  private readonly DOMParser = xmldom.DOMParser;
  private readonly XMLSerializer = xmldom.XMLSerializer;

  constructor(
    private readonly httpService: HttpService,
    private readonly empresasService: EmpresasService,
    private readonly webserviceService: WebserviceService,
  ) {}

  async substituirNfse(dados: any): Promise<any> {
    const cnpjPrestador = dados.prestador?.cnpj;
    this.logger.debug(`Iniciando substituição de NFSe para CNPJ: ${cnpjPrestador}`);
    

    try {
      if (!cnpjPrestador) {
        throw new Error('CNPJ do prestador não informado');
      }

      // 1. Buscar empresa
      const empresa = await this.empresasService.getEmpresa(cnpjPrestador);
      if (empresa instanceof HttpException || !empresa?.AMBIENTE_INTEGRACAO_ID) {
        throw new Error('Empresa não encontrada ou ambiente de integração não configurado');
      }

      // 2. Carregar certificado
      const certificado = await this.carregarCertificado(cnpjPrestador);

      // 3. Gerar XML
      const xml = this.gerarXmlSubstituicao(dados);
      this.logger.verbose('XML de substituição gerado:', xml);

      // 4. Assinar XML
      const xmlAssinado = await this.assinarXmlSubstituicao(xml, certificado.privateKey, certificado.publicCert);

      // 5. Enviar para webservice
      const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpjPrestador);
      const httpsAgent = new https.Agent({
        pfx,
        passphrase,
        rejectUnauthorized: false,
        secureOptions: crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_TLSv1,
      });

      const webservice = await this.webserviceService.getWebservice(empresa.AMBIENTE_INTEGRACAO_ID);
      if (!webservice?.LINK) {
        throw new Error('Webservice não configurado');
      }

      const response = await this.httpService.post(
        webservice.LINK,
        xmlAssinado,
        {
          headers: {
            'Content-Type': 'text/xml;charset=utf-8',
            'SOAPAction': 'http://nfse.abrasf.org.br/SubstituirNfse',
          },
          httpsAgent,
          timeout: 30000,
          responseType: 'text',
        }
      ).toPromise();

      const xmlResposta = response.data;
      this.logger.verbose('Resposta XML bruta:', xmlResposta);
      return await this.processarResposta(xmlResposta)

      // 6. Processar resposta
      const resultado = await parseStringPromise(xmlResposta, {
        explicitArray: false,
        ignoreAttrs: false,
        tagNameProcessors: [name => name.replace(/^[a-zA-Z]+:/, '')],
      });

      return resultado?.Envelope?.Body?.SubstituirNfseResponse?.SubstituirNfseResposta || null;

    } catch (error) {
      this.logger.error('Erro ao substituir NFSe:', error.message);
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno ao substituir NFSe',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private gerarXmlSubstituicao(dados: any): string {
    const cancelamento = dados.cancelamento || {};
    const rps = dados.rps || {};
    const prestador = dados.prestador || {};

    return `
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:nfse="http://nfse.abrasf.org.br">
        <soapenv:Body>
          <nfse:SubstituirNfse>
            <nfseCabecMsg>
              <cabecalho xmlns="http://www.abrasf.org.br/nfse.xsd" versao="2.04">
                <versaoDados>2.04</versaoDados>
              </cabecalho>
            </nfseCabecMsg>
            <nfseDadosMsg>
              <SubstituirNfseEnvio xmlns="http://www.abrasf.org.br/nfse.xsd">
                <SubstituicaoNfse>
                  <Pedido>
                    <InfPedidoCancelamento Id="s01">
                      <IdentificacaoNfse>
                        <Numero>${cancelamento.numero}</Numero>
                        <CpfCnpj>
                          <Cnpj>${prestador.cnpj}</Cnpj>
                        </CpfCnpj>
                        <InscricaoMunicipal>${prestador.inscricaoMunicipal}</InscricaoMunicipal>
                        <CodigoMunicipio>${cancelamento.codigoMunicipio}</CodigoMunicipio>
                      </IdentificacaoNfse>
                      <CodigoCancelamento>${cancelamento.codigoCancelamento}</CodigoCancelamento>
                    </InfPedidoCancelamento>
                  </Pedido>
                  ${this.gerarXmlRpsIndividual(rps, prestador)}
                </SubstituicaoNfse>
              </SubstituirNfseEnvio>
            </nfseDadosMsg>
          </nfse:SubstituirNfse>
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

  private async carregarCertificado(cnpj: string): Promise<{ privateKey: string; publicCert: string }> {
    const { pfx, passphrase } = await this.empresasService.buscarCertificadoPorCnpj(cnpj);
    const p12Asn1 = forge.asn1.fromDer(pfx.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);

    const keyBag = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const privateKey = keyBag[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0]?.key;
    const certBag = p12.getBags({ bagType: forge.pki.oids.certBag });
    const certificate = certBag[forge.pki.oids.certBag]?.[0]?.cert;

    return {
      privateKey: forge.pki.privateKeyToPem(privateKey),
      publicCert: forge.pki.certificateToPem(certificate),
    };
  }

  private async assinarXmlSubstituicao(xml: string, privateKey: string, publicCert: string): Promise<string> {
    const xmlDoc = new this.DOMParser().parseFromString(xml, "text/xml");

    // Assinar InfPedidoCancelamento
    const infPedidoCancelamento = xmlDoc.getElementsByTagName("InfPedidoCancelamento")[0];
    if (infPedidoCancelamento) {
      const assinaturaCancelamento = this.criarAssinatura(infPedidoCancelamento, privateKey, publicCert);
      const pedidoNode = xmlDoc.getElementsByTagName("Pedido")[0];
      pedidoNode.appendChild(assinaturaCancelamento);
    }

    // Assinar RPS
    const rps = xmlDoc.getElementsByTagName("Rps")[0];
    const infDeclaracao = rps?.getElementsByTagName("InfDeclaracaoPrestacaoServico")[0];
    if (infDeclaracao) {
      const assinaturaRps = this.criarAssinatura(infDeclaracao, privateKey, publicCert);
      rps.appendChild(assinaturaRps);
    }

    return new this.XMLSerializer().serializeToString(xmlDoc);
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
      tagNameProcessors: [name => name.replace(/^[a-zA-Z0-9]+:/, '')],
    });

    const body = resultado?.Envelope?.Body;
    const substituicao = body?.SubstituirNfseResponse?.SubstituirNfseResult;

    if (!substituicao) {
      this.logger.debug('Nenhum resultado encontrado na resposta');
      return null;
    }

    // ✅ Aqui troca para RetSubstituicao
    if (substituicao.RetSubstituicao) {
      return substituicao.RetSubstituicao;
    }

    if (substituicao.ListaMensagemRetorno) {
      return substituicao;
    }

    return null;
  } catch (error) {
    throw new Error(`Falha ao processar resposta: ${error.message}`);
  }
}
}
