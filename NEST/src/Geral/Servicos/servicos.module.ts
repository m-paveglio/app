import { Module } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { ServicosController } from './servicos.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ServicosProviders } from './servicos.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ServicosController],
  providers: [
    ...ServicosProviders,
    ServicosService,
  ],
})
export class ServicosModule {}
