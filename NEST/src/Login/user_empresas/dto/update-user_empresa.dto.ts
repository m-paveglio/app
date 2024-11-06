import { PartialType } from '@nestjs/mapped-types';
import { CreateUserEmpresaDto } from './create-user_empresa.dto'

export class UpdateUserEmpresaDto extends PartialType(CreateUserEmpresaDto) {}
