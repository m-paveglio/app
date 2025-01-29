import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { ComandasService } from './comanda.service';
import { Comandas } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';

@Controller('comandas')
export class ComandasController {
  constructor(private readonly ComandasService: ComandasService) {}

  @Get()
  getComandas(): Promise<Comandas[]> {
    return this.ComandasService.getComandas();
  }

   
  @Get(':COD_COMANDA')
  getComanda(@Param('COD_COMANDA') COD_COMANDA: string) {
    return this.ComandasService.getComanda(COD_COMANDA);
  }

  @Get('CPF_CNPJ/:CPF_CNPJ')
  getcomandaCnpj(@Param('CPF_CNPJ') CPF_CNPJ: string) {
    return this.ComandasService.getComandaCnpj(CPF_CNPJ);
  }

  @Get('NOME/:NOME')
  searchcomandaByName(@Param('NOME') NOME: string) {
    return this.ComandasService.searchComandaByName(NOME);
  }

  @Post()
  createcomanda(@Body() newcomanda: CreateComandaDto) {
    return this.ComandasService.createComanda(newcomanda);
  }

  @Delete(':COD_COMANDA')
  deletecomanda(@Param('COD_COMANDA') COD_COMANDA: string) {
    return this.ComandasService.deleteComanda(COD_COMANDA);
  }

  @Patch(':COD_COMANDA')
  updatecomanda(@Param('COD_COMANDA') COD_COMANDA: string, @Body() comandas: UpdateComandaDto) {
    return this.ComandasService.updateComanda(COD_COMANDA, comandas);
  }
}
