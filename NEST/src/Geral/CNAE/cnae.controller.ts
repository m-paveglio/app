import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { CnaeService } from './cnae.service';
import { CNAE } from './entities/cnae.entity';

@Controller('cnae')
export class CnaeController {
  constructor(private readonly cnaeService: CnaeService) {}

  @Get()
  getCnaes(): Promise<CNAE[]> {
    return this.cnaeService.getCnaes();
  }
   
  @Get(':COD_CNAE')
  getCnae(@Param('COD_CNAE') COD_CNAE: string) {
    return this.cnaeService.getCnae(COD_CNAE);
  }

  @Get('desc/:DESC_CNAE')
  searchCnaeByName(@Param('DESC_CNAE') DESC_CNAE: string) {
    return this.cnaeService.searchCnaeByName(DESC_CNAE);
  }
}
