import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebserviceService } from './webservice.service';
import { Webservice } from './entities/webservice.entity';
import { NumericType } from 'typeorm';

@Controller('webservice')
export class WebserviceController {
  constructor(private readonly WebserviceService: WebserviceService) {}

  @Get()
  getWebservices() {
    return this.WebserviceService.getWebservices();
  }

  @Get(':ID')
  getWebservice(@Param('ID') ID: number) {
    return this.WebserviceService.getWebservice(ID);
  }

  @Get('desc/:NOME_CIDADE')
  searchWebservice(@Param('NOME_CIDADE') NOME_CIDADE: string) {
    return this.WebserviceService.searchWebserviceByName(NOME_CIDADE);
  }

  @Post('atualizar')
  async atualizarWebservice(@Body() dados: Partial<Webservice>) {
    return this.WebserviceService.atualizarWebservice(dados);
  }

}