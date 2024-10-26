import { Injectable } from '@nestjs/common';
import { NfseDto } from './nfse.dto';
import * as xml2js from 'xml2js'; // Para manipulação de XML
import { SignedXml } from 'xml-crypto';
import * as fs from 'fs';
import * as forge from 'node-forge'; // Importando node-forge

@Injectable()
export class NfseService {
  async gerarNfse(nfsDto: NfseDto) {
    const builder = new xml2js.Builder();
    // Montando o XML
    const nfseXml = {
      'soap:Envelope': {
        '$': {
          'xmlns:soap': 'http://schemas.xmlsoap.org/soap/envelope/',
          'xmlns:svc': 'http://nfse.abrasf.org.br',
        },
        'soap:Body': {
          'svc:GerarNfse': {
            nfseCabecMsg: {
              cabecalho: {
                $: { versao: '1.00' },
                versaoDados: '2.04',
              },
            },
            nfseDadosMsg: {
              'GerarNfseEnvio': {
                $: { 'xmlns': 'http://www.abrasf.org.br/nfse.xsd' },
                Rps: {
                  InfDeclaracaoPrestacaoServico: {
                    $: { Id: 'declaracao_1' },
                    Rps: {
                      $: { Id: 'rps_1' },
                      IdentificacaoRps: {
                        Numero: nfsDto.numeroRps,
                        Serie: nfsDto.serieRps,
                        Tipo: nfsDto.tipoRps,
                      },
                      DataEmissao: nfsDto.dataEmissao,
                      Status: nfsDto.status,
                    },
                    Competencia: nfsDto.competencia,
                    Servico: {
                      Valores: {
                        ValorServicos: nfsDto.valorServicos,
                        Aliquota: nfsDto.aliquota,
                        ValorIss: nfsDto.valorIss,
                      },
                      IssRetido: nfsDto.issRetido,
                      ItemListaServico: nfsDto.itemListaServico,
                      CodigoCnae: nfsDto.codigoCnae,
                      CodigoTributacaoMunicipio: nfsDto.codigoTributacaoMunicipio,
                      Discriminacao: nfsDto.discriminacao,
                      CodigoMunicipio: nfsDto.codigoMunicipio,
                      ExigibilidadeISS: nfsDto.exigibilidadeIss,
                      MunicipioIncidencia: nfsDto.municipioIncidencia,
                    },
                    Prestador: {
                      CpfCnpj: {
                        Cnpj: nfsDto.cnpjPrestador,
                      },
                      InscricaoMunicipal: nfsDto.inscricaoMunicipal,
                    },
                    TomadorServico: {
                      IdentificacaoTomador: {
                        CpfCnpj: {
                          Cpf: nfsDto.cpfTomador,
                        },
                      },
                      RazaoSocial: nfsDto.razaoSocial,
                      Endereco: {
                        Endereco: nfsDto.endereco,
                        Numero: nfsDto.numero,
                        Complemento: nfsDto.complemento,
                        Bairro: nfsDto.bairro,
                        CodigoMunicipio: nfsDto.codigoMunicipio,
                        Uf: nfsDto.uf,
                        Cep: nfsDto.cep,
                      },
                    },
                    OptanteSimplesNacional: nfsDto.optanteSimplesNacional,
                    IncentivoFiscal: nfsDto.incentivoFiscal,
                  },
                },
              },
            },
          },
        },
      },
    };
    const xmlString = builder.buildObject(nfseXml);

    // Gerando a assinatura digital
    try {
      // Lendo o arquivo PFX
      const pfxBuffer = fs.readFileSync("./src/Certificados/ASSOCIACAO CANNABICA MEDICINAL ASCAMED-46368439000172.pfx");
      const pfxAsn1 = forge.asn1.fromDer(forge.util.createBuffer(pfxBuffer.toString('binary'), 'binary'));
      const pfx = forge.pkcs12.pkcs12FromAsn1(pfxAsn1, false, '1234'); // Substitua pela sua senha

      // Extraindo o certificado e a chave privada
      const keyObj = pfx.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })[forge.pki.oids.pkcs8ShroudedKeyBag][0];
      const certObj = pfx.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag][0];

      const privateKey = forge.pki.privateKeyToAsn1(keyObj.key);
      const certificate = forge.pki.certificateToAsn1(certObj.cert);

      // Convertendo a chave privada para PEM
      const privateKeyPem = forge.pki.privateKeyToPem(privateKey);
      const signedXml = new SignedXml({ privateKey: privateKeyPem });
      signedXml.addReference({
        xpath: "//*[local-name(.)='Rps']", // Ajuste o XPath para o nó correto
        digestAlgorithm: "http://www.w3.org/2000/09/xmldsig#sha1",
        transforms: ["http://www.w3.org/2001/10/xml-exc-c14n#"],
      });
      signedXml.canonicalizationAlgorithm = "http://www.w3.org/2001/10/xml-exc-c14n#";
      signedXml.signatureAlgorithm = "http://www.w3.org/2000/09/xmldsig#rsa-sha1";
      signedXml.computeSignature(xmlString);

      // Retornando o XML assinado
      return signedXml.getSignedXml();
    } catch (error) {
      console.error("Erro ao assinar o XML:", error);
      throw new Error("Falha na assinatura do XML.");
    }
  }
}