import { Module } from '@nestjs/common';
import { ItemLCService } from './itemLC.service';
import { ItemLCController } from './itemLC.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ItemLCProviders } from './itemLC.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ItemLCController],
  providers: [
    ...ItemLCProviders,
    ItemLCService,
  ],
})
export class ItemLCModule {}
