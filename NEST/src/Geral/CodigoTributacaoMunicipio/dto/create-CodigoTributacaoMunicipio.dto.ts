import { IsNotEmpty, IsString, IsNumber, IsDecimal } from 'class-validator';

export class CreateCodigoTributacaoMunicipioDto {
  @IsString()
  COD_ATIVIDADE: string;

  @IsString()
  DESC_ATIVIDADE: string;
}