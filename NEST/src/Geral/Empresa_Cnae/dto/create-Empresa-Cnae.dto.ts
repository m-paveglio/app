import { IsString } from 'class-validator';

export class CreateEmpresaCnaeDto {
  @IsString()
  CNPJ: string;

  @IsString()
  COD_CNAE: string;
}