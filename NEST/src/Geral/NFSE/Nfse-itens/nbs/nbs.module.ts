import { Module } from '@nestjs/common';
import { NbsService } from './nbs.service';
import { NbsController } from './nbs.controller';
import { DatabaseModule } from 'src/database/database.module';
import { NbsProviders } from './nbs.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [NbsController],
  providers: [
    ...NbsProviders,
    NbsService],
})
export class NbsModule {}
