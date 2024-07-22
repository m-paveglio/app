import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PermissoesService } from './permissoes.service';

@Controller('permissoes')
export class PermissoesController {
  constructor(private readonly permissoesService: PermissoesService) {}

  @Get()
  getPermissoes() {
    return this.permissoesService.getPermissoes();
  }

  @Get(':COD_PERMISSAO')
  getPermissao(@Param('COD_PERMISSAO') COD_PERMISSAO: string) {
    return this.permissoesService.getPermissao(COD_PERMISSAO);
  }

  @Get('desc/:DESC_PERMISSAO')
  searchPermissao(@Param('DESC_PERMISSAO') DESC_PERMISSAO: string) {
    return this.permissoesService.searchPermmissaoByName(DESC_PERMISSAO);
  }

}
