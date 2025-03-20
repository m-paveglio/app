import { PartialType } from '@nestjs/mapped-types';
import { CreateComandaXServicoDto } from './create-comandaXservico.dto';

export class UpdateComandaXServicoDto extends PartialType(CreateComandaXServicoDto) {}