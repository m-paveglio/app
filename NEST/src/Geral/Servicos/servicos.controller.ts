import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { ServicosService } from './servicos.service';
import { Servicos } from './entities/servico.entity';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Controller('servicos')
export class ServicosController {
  constructor(private readonly ServicosService: ServicosService) {}

  @Get()
  getServicos(): Promise<Servicos[]> {
    return this.ServicosService.getServicos();
  }

  
  @Get(':COD_SERVICO')
  getServico(@Param('COD_SERVICO') COD_SERVICO: string) {
    return this.ServicosService.getServico(COD_SERVICO);
  }

  @Get('desc/:DESC_SERVICO')
  searchServicoByName(@Param('DESC_SERVICO') DESC_SERVICO: string) {
    return this.ServicosService.searchServicoByName(DESC_SERVICO);
  }

  @Post()
  createServico(@Body() newServico: CreateServicoDto) {
    return this.ServicosService.createServico(newServico);
  }

  @Delete(':COD_SERVICO')
  deleteServico(@Param('COD_SERVICO') COD_SERVICO: string) {
    return this.ServicosService.deleteServico(COD_SERVICO);
  }

  @Patch(':COD_SERVICO')
  updateServico(@Param('COD_SERVICO') COD_SERVICO: string, @Body() Servicos: UpdateServicoDto) {
    return this.ServicosService.updateServico(COD_SERVICO, Servicos);
  }
}
