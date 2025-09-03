import { PartialType } from '@nestjs/mapped-types';
import { CreateWebserviceDto } from './create-webservice.dto';

export class UpdateWebserviceDto extends PartialType(CreateWebserviceDto) {}