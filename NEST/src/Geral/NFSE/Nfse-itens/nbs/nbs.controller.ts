import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NbsService } from './nbs.service';

@Controller('nbs')
export class NbsController {
  constructor(private readonly NbsService: NbsService) {}

  @Get()
  getNbss() {
    return this.NbsService.getNbss();
  }

  @Get(':COD_NBS')
  getNbs(@Param('COD_NBS') COD_NBS: string) {
    return this.NbsService.getNbs(COD_NBS);
  }

  @Get('desc/:DESC_NBS')
  searchNbsByName(@Param('DESC_NBS') DESC_NBS: string) {
    return this.NbsService.searchNbsByName(DESC_NBS);
  }

}
