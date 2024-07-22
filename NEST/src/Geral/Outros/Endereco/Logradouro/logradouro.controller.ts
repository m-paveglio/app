import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { LogradouroService } from './logradouro.service';
import { Logradouro } from './entities/logradouro.entity';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';

@Controller('logradouro')
export class LogradouroController {
  constructor(private readonly LogradouroService: LogradouroService) {}

  @Get()
  getLogradouros(): Promise<Logradouro[]> {
    return this.LogradouroService.getLogradouros();
  }

  @Get(':CEP')
  getLogradouro(@Param('CEP') CEP: string) {
    return this.LogradouroService.getLogradouro(CEP);
  }

  @Get('desc/:NOME_DO_LOGRADOURO')
  searchLogradouroByName(@Param('NOME_DO_LOGRADOURO') NOME_DO_LOGRADOURO: string) {
    return this.LogradouroService.searchLogradouroByName(NOME_DO_LOGRADOURO);
  }

  @Post()
  createLogradouro(@Body() newLogradouro: CreateLogradouroDto) {
    return this.LogradouroService.createLogradouro(newLogradouro);
  }

  @Delete(':COD_LOGRADOURO')
  deleteLogradouro(@Param('cpf') cpf: string) {
    return this.LogradouroService.deleteLogradouro(cpf);
  }

  @Patch(':COD_LOGRADOURO')
  updateLogradouro(@Param('COD_LOGRADOURO') COD_LOGRADOURO: string, @Body() Logradouro: UpdateLogradouroDto) {
    return this.LogradouroService.updateLogradouro(COD_LOGRADOURO, Logradouro);
  }
}
