import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaCnaeDto } from './create-Empresa-Cnae.dto';

export class UpdateEmpresaCnaeDto extends PartialType(CreateEmpresaCnaeDto) {}