import { IsString } from 'class-validator';

export class CreateEmpresaITEMLCDto {
  @IsString()
  CNPJ: string;

  @IsString()
  COD_ITEM_LC: string;
}