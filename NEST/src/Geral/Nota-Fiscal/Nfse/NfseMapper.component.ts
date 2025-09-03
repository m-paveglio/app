import { parseStringPromise, processors } from 'xml2js';
import { NFSE } from './nfse.entity';

export class NfseMapper {
  static async mapFromXml(xml: string): Promise<Partial<NFSE> | null> {
    const json = await parseStringPromise(xml, { 
      explicitArray: false,
      tagNameProcessors: [processors.stripPrefix] // remove soap:, s:, etc.
    });

    try {
      const nfse = json?.Envelope?.Body?.GerarNfseResponse?.GerarNfseResposta
        ?.ListaNfse?.CompNfse?.Nfse?.InfNfse;

      if (!nfse) return null;

      const declaracao = nfse?.DeclaracaoPrestacaoServico?.InfDeclaracaoPrestacaoServico || {};
      const rps = declaracao.Rps || {};

      return {
        // NFSe
        NumeroNfse: nfse.Numero,
        CodigoVerificacao: nfse.CodigoVerificacao,
        DataAutorizacao: nfse.DataEmissao,
        Competencia: declaracao.Competencia,

        // RPS
        NumeroRps: rps?.IdentificacaoRps?.Numero,
        SerieRps: rps?.IdentificacaoRps?.Serie,
        TipoRps: rps?.IdentificacaoRps?.Tipo,
        DataEmissaoRps: rps?.DataEmissao,
        StatusRps: rps?.Status,

        // Prestador
        CnpjPrestador: declaracao.Prestador?.CpfCnpj?.Cnpj,
        CpfPrestador: declaracao.Prestador?.CpfCnpj?.Cpf,
        InscricaoMunicipalPrestador: declaracao.Prestador?.InscricaoMunicipal,

        // Tomador
        CnpjTomador: declaracao.TomadorServico?.IdentificacaoTomador?.CpfCnpj?.Cnpj,
        CpfTomador: declaracao.TomadorServico?.IdentificacaoTomador?.CpfCnpj?.Cpf,
        RazaoSocialTomador: declaracao.TomadorServico?.RazaoSocial,
        InscricaoMunicipalTomador: declaracao.TomadorServico?.IdentificacaoTomador?.InscricaoMunicipal,
        EmailTomador: declaracao.TomadorServico?.Contato?.Email,
        TelefoneTomador: declaracao.TomadorServico?.Contato?.Telefone,

        // Endereço Tomador
        EnderecoTomador: declaracao.TomadorServico?.Endereco?.Endereco,
        NumeroEnderecoTomador: declaracao.TomadorServico?.Endereco?.Numero,
        ComplementoEnderecoTomador: declaracao.TomadorServico?.Endereco?.Complemento,
        BairroTomador: declaracao.TomadorServico?.Endereco?.Bairro,
        CodigoMunicipioTomador: declaracao.TomadorServico?.Endereco?.CodigoMunicipio,
        UfTomador: declaracao.TomadorServico?.Endereco?.Uf,
        CepTomador: declaracao.TomadorServico?.Endereco?.Cep,
        CodigoPaisTomador: declaracao.TomadorServico?.Endereco?.CodigoPais,

        // Serviço
        ItemListaServico: declaracao.Servico?.ItemListaServico,
        CodigoCnae: declaracao.Servico?.CodigoCnae,
        CodigoTributacaoMunicipio: declaracao.Servico?.CodigoTributacaoMunicipio,
        Discriminacao: declaracao.Servico?.Discriminacao,
        CodigoMunicipio: declaracao.Servico?.CodigoMunicipio,

        // Valores
        ValorServicos: declaracao.Servico?.Valores?.ValorServicos,
        ValorIss: declaracao.Servico?.Valores?.ValorIss,
        Aliquota: declaracao.Servico?.Valores?.Aliquota,
        IssRetido: declaracao.Servico?.IssRetido,

        // Situação
        Status: 'AUTORIZADA',

        // XMLs
        XmlResposta: xml,
        DataConsulta: new Date()
      };
    } catch (error) {
      console.error('Erro ao mapear NFSe:', error);
      console.error('JSON convertido:', JSON.stringify(json, null, 2));
      return null;
    }
  }
}
