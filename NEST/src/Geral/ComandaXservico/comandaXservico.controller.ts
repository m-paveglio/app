import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { ComandasXServicoService } from './comandaXservico.service';
import { ComandasXServicos } from './entities/comandaXservico.entity';
import { CreateComandaXServicoDto } from './dto/create-comandaXservico.dto';
import { UpdateComandaXServicoDto } from './dto/update-comandaXservico.dto';

@Controller('comandasXservico')
export class ComandasXServicoController {
  constructor(private readonly ComandasXServicoService: ComandasXServicoService) {}

 
  @Get(':COD_COMANDA')
  getComandaXservico(@Param('COD_COMANDA') COD_COMANDA: string) {
    return this.ComandasXServicoService.getComandaXservico(COD_COMANDA);
  }

  @Get('CNPJ_PRESTADOR/:CNPJ_PRESTADOR')
  getcomandaCnpjXservico(@Param('CNPJ_PRESTADOR') CNPJ_PRESTADOR: string) {
    return this.ComandasXServicoService.getComandaCnpjXservico(CNPJ_PRESTADOR);
  }

  @Post(':COD_COMANDA')
createcomandaXservico(
  @Param('COD_COMANDA') COD_COMANDA: string,
  @Body() dadosServico: CreateComandaXServicoDto
) {
  return this.ComandasXServicoService.createComandaXservico(COD_COMANDA, dadosServico);
}

@Delete(':COD_COMANDA/:COD_SERVICO')
deleteComandaXservico(
  @Param('COD_COMANDA') COD_COMANDA: string,
  @Param('COD_SERVICO') COD_SERVICO: string,
) {
  return this.ComandasXServicoService.deleteComandaXservico(COD_COMANDA, COD_SERVICO);
}

  @Patch(':COD_COMANDA')
  updatecomandaXservico(@Param('COD_COMANDA') COD_COMANDA: string, @Body() comandas: UpdateComandaXServicoDto) {
    return this.ComandasXServicoService.updateComandaXservico(COD_COMANDA, comandas);
  }

}
