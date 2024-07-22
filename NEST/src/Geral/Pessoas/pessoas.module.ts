import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { pessoasProviders } from './pessoas.providers';
import { pessoasService } from './pessoas.service';
import { pessoasController } from './pessoas.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [pessoasController],
  providers: [
    ...pessoasProviders,
    pessoasService,
  ],
})
export class pessoasModule {}