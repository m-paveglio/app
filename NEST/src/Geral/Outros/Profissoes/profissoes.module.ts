import { Module } from '@nestjs/common';
import { ProfissoesService } from './profissoes.service';
import { ProfissoesController } from './profissoes.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ProfissoesProviders } from './profissoes.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ProfissoesController],
  providers: [
    ...ProfissoesProviders,
    ProfissoesService,
  ],
})
export class ProfissoesModule {}
