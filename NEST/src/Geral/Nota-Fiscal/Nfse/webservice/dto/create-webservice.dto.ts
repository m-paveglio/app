import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateWebserviceDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  NOME_CIDADE?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  LINK?: string;
}