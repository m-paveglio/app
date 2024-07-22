import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemService } from './item_lc_116.service';

@Controller('item')
export class ItemLc116Controller {
  constructor(private readonly ItemService: ItemService) {}

  @Get()
  getItensLC116() {
    return this.ItemService.getItensLC116();
  }

  @Get(':COD_ITEM')
  getPermissao(@Param('COD_ITEM') COD_ITEM: string) {
    return this.ItemService.getItemLC116(COD_ITEM);
  }

  @Get('desc/:DESC_ITEM')
  searchPermissao(@Param('DESC_ITEM') DESC_ITEM: string) {
    return this.ItemService.searchItemLC116ByName(DESC_ITEM);
  }

}
