import { Module } from '@nestjs/common';
import { AtividadesMunicipaisService } from './atividades_municipais.service';
import { AtividadesMunicipaisController } from './atividades_municipais.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AtividadesMunicipaisProviders } from './atividades_municipais.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [AtividadesMunicipaisController],
  providers: [
    ...AtividadesMunicipaisProviders,
    AtividadesMunicipaisService],
})
export class AtividadesMunicipaisModule {}
