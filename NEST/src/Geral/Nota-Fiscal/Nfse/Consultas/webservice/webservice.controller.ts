import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WebserviceService } from './webservice.service';
import { Webservice } from './entities/webservice.entity';
import { NumericType } from 'typeorm';
import { createPessoasDto } from 'src/Geral/Pessoas/dto/create-pessoas-dto';
import { CreateWebserviceDto } from './dto/create-webservice.dto';
import { UpdateWebserviceDto } from './dto/update-webservice.dto';

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

  @Post()
  criarWebservice(@Body() dados: CreateWebserviceDto) {
    return this.WebserviceService.criarWebservice(dados);
  }

  @Patch(':ID')
  atualizarWebservice(@Param('ID') ID: number, @Body() dados: UpdateWebserviceDto) {
    return this.WebserviceService.atualizarWebservice(ID, dados);
  }

  @Delete(':ID')
  removerWebservice(@Param('ID') ID: number) {
    return this.WebserviceService.removerWebservice(ID);
  }

}