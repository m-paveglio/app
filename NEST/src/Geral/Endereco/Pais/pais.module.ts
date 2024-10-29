import { Module } from '@nestjs/common';
import { PaisService } from './pais.service';
import { PaisController } from './pais.controller';
import { DatabaseModule } from 'src/database/database.module';
import { paisProviders } from './pais.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [PaisController],
  providers: [
    ...paisProviders,
    PaisService,
  ],
})
export class PaisModule {}
