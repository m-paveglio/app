import { IsString, IsNumber, IsOptional, IsDate, IsDecimal } from 'class-validator';

export class CreateComandaDto {
  @IsString()
  COD_COMANDA: string;

  @IsOptional()  // Esse campo é opcional, pois pode ser nulo no banco
  @IsString()
  CPF_CNPJ: string;

  @IsString()
  NOME: string;

  @IsString()
  COD_SERVICO: string;

  @IsDecimal()
  VALOR: number;

  @IsDecimal()
  QUANTIDADE: number;

  @IsDecimal()
  VALOR_FINAL: number;

  @IsDate()
  DATA_INICIO: Date;
  
  @IsOptional()
  @IsDate()
  DATA_FINAL: Date;
}
