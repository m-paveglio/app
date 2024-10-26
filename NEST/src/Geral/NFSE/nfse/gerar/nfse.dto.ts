import { IsString, IsNumber, IsDateString } from 'class-validator';

export class NfseDto {
  @IsNumber()
  numeroRps: number;

  @IsString()
  serieRps: string;

  @IsNumber()
  tipoRps: number;

  @IsDateString()
  dataEmissao: string;

  @IsNumber()
  status: number;

  @IsDateString()
  competencia: string;

  @IsNumber()
  valorServicos: number;

  @IsNumber()
  aliquota: number;

  @IsNumber()
  valorIss: number;

  @IsNumber()
  issRetido: number;

  @IsString()
  itemListaServico: string;

  @IsString()
  codigoCnae: string;

  @IsString()
  codigoTributacaoMunicipio: string;

  @IsString()
  discriminacao: string;

  @IsString()
  codigoMunicipio: string;

  @IsNumber()
  exigibilidadeIss: number;

  @IsString()
  municipioIncidencia: string;

  @IsString()
  cnpjPrestador: string;

  @IsString()
  inscricaoMunicipal: string;

  @IsString()
  cpfTomador: string;

  @IsString()
  razaoSocial: string;

  @IsString()
  endereco: string;

  @IsString()
  numero: string;

  @IsString()
  complemento: string;

  @IsString()
  bairro: string;

  @IsString()
  uf: string;

  @IsString()
  cep: string;

  @IsNumber()
  optanteSimplesNacional: number;

  @IsNumber()
  incentivoFiscal: number;
}
