import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaITEMLCDto } from './create-Empresa-ITEMLC.dto';

export class UpdateEmpresaITEMLCDto extends PartialType(CreateEmpresaITEMLCDto) {}