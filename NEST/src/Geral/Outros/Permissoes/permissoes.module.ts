import { Module } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';
import { PermissoesController } from './permissoes.controller';
import { PermissoesProviders } from './permissoes.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [PermissoesController],
  providers: [
    ...PermissoesProviders,
    PermissoesService,
  ],
})
export class PermissoesModule {}
