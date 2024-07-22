import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CnaeService } from './cnae.service';

@Controller('cnae')
export class CnaeController {
  constructor(private readonly CnaeService: CnaeService) {}

  @Get()
  getCnaes() {
    return this.CnaeService.getCnaes();
  }

  @Get(':COD_CNAE')
  getCnae(@Param('COD_CNAE') COD_CNAE: string) {
    return this.CnaeService.getCnae(COD_CNAE);
  }

  @Get('desc/:DESC_CNAE')
  searchCnaeByName(@Param('DESC_CNAE') DESC_CNAE: string) {
    return this.CnaeService.searchCnaeByName(DESC_CNAE);
  }

}
