import { IsNotEmpty, IsString, IsNumber, IsDecimal } from 'class-validator';

export class CreateCodigoTributacaoMunicipioDto {
  @IsString()
  CNPJ: string;
  
  @IsString()
  COD_ATIVIDADE: string;

  @IsString()
  DESC_ATIVIDADE: string;
}