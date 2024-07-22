import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CidadesService } from './cidades.service';

@Controller('cidades')
export class CidadesController {
  constructor(private readonly CidadesService: CidadesService) {}

  @Get()
  getCidades() {
    return this.CidadesService.getCidades();
  }

  @Get(':COD_CIDADE')
  getCidade(@Param('COD_CIDADE') COD_CIDADE: string) {
    return this.CidadesService.getCidade(COD_CIDADE);
  }

  @Get('desc/:NOME_CIDADE')
  searchPais(@Param('NOME_CIDADE') NOME_CIDADE: string) {
    return this.CidadesService.searchCidadeByName(NOME_CIDADE);
  }

}