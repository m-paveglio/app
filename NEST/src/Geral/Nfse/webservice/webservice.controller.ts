import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebserviceService } from './webservice.service';

@Controller('webservice')
export class WebserviceController {
  constructor(private readonly WebserviceService: WebserviceService) {}

  @Get()
  getWebservices() {
    return this.WebserviceService.getWebservices();
  }

  @Get(':ID')
  getWebservice(@Param('ID') ID: string) {
    return this.WebserviceService.getWebservice(ID);
  }

  @Get('desc/:NOME_CIDADE')
  searchWebservice(@Param('NOME_CIDADE') NOME_CIDADE: string) {
    return this.WebserviceService.searchWebserviceByName(NOME_CIDADE);
  }

}