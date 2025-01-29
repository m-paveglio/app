import { Module } from '@nestjs/common';
import { ComandasService } from './comanda.service';
import { ComandasController } from './comanda.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ComandasProviders } from './comanda.providers';


@Module({
  imports: [DatabaseModule],
  controllers: [ComandasController],
  providers: [
    ...ComandasProviders,
    ComandasService,
  ],
})
export class ComandasModule {}
