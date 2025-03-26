import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('NFSE')
export class NFSE {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text', nullable: true })
  NumeroLote: string;

  @Column({ type: 'text', nullable: true })
  CnpjPrestador: string;

  @Column({ type: 'text', nullable: true })
  CpfPrestador: string;

  @Column({ type: 'text', nullable: true })
  InscricaoMunicipalPrestador: string;

  @Column({ type: 'int', nullable: true })
  QuantidadeRps: number;

  @Column({ type: 'text', nullable: true })
  NumeroRps: string;

  @Column({ type: 'text', nullable: true })
  SerieRps: string;

  @Column({ type: 'int', nullable: true })
  TipoRps: number;

  @Column({ type: 'text', nullable: true })
  DataEmissaoRps: string;

  @Column({ type: 'int', nullable: true })
  StatusRps: number;

  @Column({ type: 'text', nullable: true })
  NumeroRpsSubstituido: string;

  @Column({ type: 'text', nullable: true })
  SerieRpsSubstituido: string;

  @Column({ type: 'int', nullable: true })
  TipoRpsSubstituido: number;

  @Column({ type: 'text', nullable: true })
  Competencia: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorServicos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorDeducoes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorPis: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorCofins: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorInss: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorIr: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorCsll: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  OutrasRetencoes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValTotTributos: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorIss: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  Aliquota: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  DescontoIncondicionado: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  DescontoCondicionado: number;

  @Column({ type: 'int', nullable: true })
  IssRetido: number;

  @Column({ type: 'int', nullable: true })
  ResponsavelRetencao: number;

  @Column({ type: 'text', nullable: true })
  ItemListaServico: string;

  @Column({ type: 'text', nullable: true })
  CodigoCnae: string;

  @Column({ type: 'text', nullable: true })
  CodigoTributacaoMunicipio: string;

  @Column({ type: 'text', nullable: true })
  CodigoNbs: string;

  @Column({ type: 'text', nullable: true })
  Discriminacao: string;

  @Column({ type: 'text', nullable: true })
  CodigoMunicipio: string;

  @Column({ type: 'text', nullable: true })
  CodigoPais: string;

  @Column({ type: 'int', nullable: true })
  ExigibilidadeISS: number;

  @Column({ type: 'text', nullable: true })
  IdentifNaoExigibilidade: string;

  @Column({ type: 'text', nullable: true })
  MunicipioIncidencia: string;

  @Column({ type: 'text', nullable: true })
  NumeroProcesso: string;

  @Column({ type: 'text', nullable: true })
  CnpjTomador: string;

  @Column({ type: 'text', nullable: true })
  CpfTomador: string;

  @Column({ type: 'text', nullable: true })
  InscricaoMunicipalTomador: string;

  @Column({ type: 'text', nullable: true })
  NifTomador: string;

  @Column({ type: 'text', nullable: true })
  RazaoSocialTomador: string;

  @Column({ type: 'text', nullable: true })
  EnderecoTomador: string;

  @Column({ type: 'text', nullable: true })
  NumeroEnderecoTomador: string;

  @Column({ type: 'text', nullable: true })
  ComplementoEnderecoTomador: string;

  @Column({ type: 'text', nullable: true })
  BairroTomador: string;

  @Column({ type: 'text', nullable: true })
  CodigoMunicipioTomador: string;

  @Column({ type: 'text', nullable: true })
  UfTomador: string;

  @Column({ type: 'text', nullable: true })
  CepTomador: string;

  @Column({ type: 'text', nullable: true })
  CodigoPaisTomador: string;

  @Column({ type: 'text', nullable: true })
  EnderecoCompletoExteriorTomador: string;

  @Column({ type: 'text', nullable: true })
  TelefoneTomador: string;

  @Column({ type: 'text', nullable: true })
  EmailTomador: string;

  @Column({ type: 'text', nullable: true })
  CnpjIntermediario: string;

  @Column({ type: 'text', nullable: true })
  CpfIntermediario: string;

  @Column({ type: 'text', nullable: true })
  InscricaoMunicipalIntermediario: string;

  @Column({ type: 'text', nullable: true })
  RazaoSocialIntermediario: string;

  @Column({ type: 'text', nullable: true })
  CodigoMunicipioIntermediario: string;

  @Column({ type: 'text', nullable: true })
  CodigoObra: string;

  @Column({ type: 'text', nullable: true })
  Art: string;

  @Column({ type: 'text', nullable: true })
  RegimeEspecialTributacao: string;

  @Column({ type: 'int', nullable: true })
  OptanteSimplesNacional: number;

  @Column({ type: 'int', nullable: true })
  IncentivoFiscal: number;

  @Column({ type: 'text', nullable: true })
  IdentificacaoEvento: string;

  @Column({ type: 'text', nullable: true })
  DescricaoEvento: string;

  @Column({ type: 'text', nullable: true })
  InformacoesComplementares: string;

  @Column({ type: 'int', nullable: true })
  TipoDeducao: number;

  @Column({ type: 'text', nullable: true })
  DescricaoDeducao: string;

  @Column({ type: 'text', nullable: true })
  CodigoMunicipioGerador: string;

  @Column({ type: 'text', nullable: true })
  NumeroNfse: string;

  @Column({ type: 'text', nullable: true })
  CodigoVerificacao: string;

  @Column({ type: 'text', nullable: true })
  NumeroNfe: string;

  @Column({ type: 'text', nullable: true })
  UfNfe: string;

  @Column({ type: 'text', nullable: true })
  ChaveAcessoNfe: string;

  @Column({ type: 'text', nullable: true })
  IdentificacaoDocumentoDeducao: string;

  @Column({ type: 'text', nullable: true })
  IdentificacaoFornecedor: string;

  @Column({ type: 'text', nullable: true })
  NifFornecedor: string;

  @Column({ type: 'text', nullable: true })
  CodigoPaisFornecedor: string;

  @Column({ type: 'text', nullable: true })
  DataEmissaoDeducao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorDedutivel: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  ValorUtilizadoDeducao: number;

  @Column({ type: 'text', nullable: true })
  Protocolo: string;

  @Column({ type: 'text', nullable: true })
  Status: string;
  
}