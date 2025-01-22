import { IsNotEmpty, IsString, IsNumber, IsDecimal } from 'class-validator';

export class CreateServicoDto {
  @IsString()
  COD_SERVICO: string;

  @IsString()
  DESC_SERVICO: string;


  @IsDecimal({ decimal_digits: '2' })
  VALOR: number;


  @IsString()
  CNAE: string;


  @IsString()
  ITEM_LC: string;


  @IsString()
  ATIVIDADE_MUNICIPIO: string;
}