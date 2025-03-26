import { IsNumber, IsString, Length } from 'class-validator';

export class CreateEmpresaDto {
  @IsString()
  @Length(14, 14)
  CNPJ: string;

  @IsString()
  @Length(1, 50)
  IM: string;

  @IsString()
  @Length(1, 300)
  NOME: string;

  @IsString()
  @Length(2, 2)
  OPTANTE_SN: string;

  @IsNumber()
  AMBIENTE_INTEGRACAO_ID: number; // Corrigido para number e nome correto
}