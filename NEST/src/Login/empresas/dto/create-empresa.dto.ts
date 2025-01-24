import { IsString, Length } from 'class-validator';

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

  @IsString()
  @Length(1, 2)
  AMBIENTE_INTEGRACAO: string;
}