import { PartialType } from '@nestjs/mapped-types';
import { CreateCodigoTributacaoMunicipioDto } from './create-CodigoTributacaoMunicipio.dto';

export class UpdateCodigoTributacaoMunicipioDto extends PartialType(CreateCodigoTributacaoMunicipioDto) {}