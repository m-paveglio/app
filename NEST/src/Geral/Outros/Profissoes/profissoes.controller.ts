import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { ProfissoesService } from './profissoes.service';
import { Profissoes } from './entities/profissoes.entity';
import { CreateProfissoesDto } from './dto/create-profissoes.dto';
import { UpdateProfissoesDto } from './dto/update-profissoes.dto';

@Controller('profissoes')
export class ProfissoesController {
  constructor(private readonly ProfissoesService: ProfissoesService) {}

  @Get()
  getProfissoes(): Promise<Profissoes[]> {
    return this.ProfissoesService.getProfissoes();
  }

  
  @Get(':COD_PROFISSAO')
  getProfissao(@Param('COD_PROFISSAO') COD_PROFISSAO: string) {
    return this.ProfissoesService.getProfissao(COD_PROFISSAO);
  }

  @Get('desc/:DESC_PROFISSAO')
  searchProfissaoByName(@Param('DESC_PROFISSAO') DESC_PROFISSAO: string) {
    return this.ProfissoesService.searchProfissaoByName(DESC_PROFISSAO);
  }

  @Post()
  createProfissao(@Body() newProfissao: CreateProfissoesDto) {
    return this.ProfissoesService.createProfissao(newProfissao);
  }

  @Delete(':COD_PROFISSAO')
  deleteProfissao(@Param('COD_PROFISSAO') COD_PROFISSAO: string) {
    return this.ProfissoesService.deleteProfissao(COD_PROFISSAO);
  }

  @Patch(':COD_PROFISSAO')
  updateProfissao(@Param('COD_PROFISSAO') COD_PROFISSAO: string, @Body() Profissoes: UpdateProfissoesDto) {
    return this.ProfissoesService.updateProfissao(COD_PROFISSAO, Profissoes);
  }
}
