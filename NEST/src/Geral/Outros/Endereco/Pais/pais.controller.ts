import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PaisService } from './pais.service';

@Controller('pais')
export class PaisController {
  constructor(private readonly PaisService: PaisService) {}

  @Get()
  getPaises() {
    return this.PaisService.getPaises();
  }

  @Get(':ID_PAIS')
  getPais(@Param('ID_PAIS') ID_PAIS: string) {
    return this.PaisService.getPais(ID_PAIS);
  }

  @Get('desc/:NOME_PAIS')
  searchPais(@Param('NOME_PAIS') NOME_PAIS: string) {
    return this.PaisService.searchPaisByName(NOME_PAIS);
  }

}