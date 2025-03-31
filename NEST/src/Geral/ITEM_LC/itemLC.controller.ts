import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { ItemLCService } from './itemLC.service';
import { ItemLC } from './entities/itemLC.entity';

@Controller('ItemLC')
export class ItemLCController {
  constructor(private readonly itemlcService: ItemLCService) {}

  @Get()
  getItemLCs(): Promise<ItemLC[]> {
    return this.itemlcService.getItemLCs();
  }
   
  @Get(':COD_ITEM_LC')
  getItemLC(@Param('COD_ITEM_LC') COD_ITEM_LC: string) {
    return this.itemlcService.getItemLC(COD_ITEM_LC);
  }

  @Get('desc/:DESC_ITEM_LC')
  searchItemLCByName(@Param('DESC_ITEM_LC') DESC_ITEM_LC: string) {
    return this.itemlcService.searchItemLCByName(DESC_ITEM_LC);
  }
}
