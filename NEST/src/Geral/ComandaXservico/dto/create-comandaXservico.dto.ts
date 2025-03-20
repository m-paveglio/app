import { IsString, IsNumber, IsOptional, IsDate, IsDecimal } from 'class-validator';

export class CreateComandaXServicoDto {
  @IsString()
  COD_COMANDA: string;

  @IsString()
  CNPJ_PRESTADOR: string;

  @IsString()
  COD_SERVICO: string;

  @IsDecimal()
  VALOR: number;

  @IsDecimal()
  QUANTIDADE: number;

  @IsDecimal()
  VALOR_FINAL: number;

}
