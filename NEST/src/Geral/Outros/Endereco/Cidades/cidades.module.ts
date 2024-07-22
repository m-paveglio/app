import { Module } from '@nestjs/common';
import { CidadesService } from './cidades.service';
import { CidadesController } from './cidades.controller';
import { cidadesProviders } from './cidades.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CidadesController],
  providers: [
    ...cidadesProviders,
    CidadesService,
  ],
})
export class CidadesModule {}
