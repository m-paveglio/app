import { Module } from '@nestjs/common';
import { ComandasXServicoService } from './comandaXservico.service';
import { ComandasXServicoController } from './comandaXservico.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ComandasXServicoProviders } from './comandaXservico.providers';


@Module({
  imports: [DatabaseModule],
  controllers: [ComandasXServicoController],
  providers: [
    ...ComandasXServicoProviders,
    ComandasXServicoService,
  ],
})
export class ComandasXServicoModule {}
