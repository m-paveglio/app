import { Module } from '@nestjs/common';
import { ItemService } from './item_lc_116.service';
import { ItemLc116Controller } from './item_lc_116.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ItemProviders } from './item_lc_116.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ItemLc116Controller],
  providers: [
    ...ItemProviders,
    ItemService],
})
export class ItemLc116Module {}
