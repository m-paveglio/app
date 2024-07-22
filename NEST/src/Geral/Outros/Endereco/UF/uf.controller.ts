import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UfService } from './uf.service';

@Controller('uf')
export class UfController {
  constructor(private readonly UfService: UfService) {}

  @Get()
  getUFs() {
    return this.UfService.getUFs();
  }

  @Get(':COD_UF')
  getUF(@Param('COD_UF') COD_UF: string) {
    return this.UfService.getUF(COD_UF);
  }

  @Get('desc/:NOME_DA_UF')
  searchUF(@Param('NOME_DA_UF') NOME_DA_UF: string) {
    return this.UfService.searchUFByName(NOME_DA_UF);
  }

}
