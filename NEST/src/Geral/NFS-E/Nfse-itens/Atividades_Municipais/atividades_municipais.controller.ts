import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { AtividadesMunicipaisService } from './atividades_municipais.service';
import { ATIVIDADES } from './entities/atividades_municipais.entity';
import { CreateAtividadesMunicipaisDto } from './dto/create-atividades_municipai.dto';
import { UpdateAtividadesMunicipaisDto } from './dto/update-atividades_municipai.dto';

@Controller('atividades')
export class AtividadesMunicipaisController {
  constructor(private readonly AtividadesMunicipaisService: AtividadesMunicipaisService) {}

  @Get()
  getAtividades(): Promise<ATIVIDADES[]> {
    return this.AtividadesMunicipaisService.getAtividades();
  }

  @Get(':COD_ATIVIDADE')
  getAtividade(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string) {
    return this.AtividadesMunicipaisService.getAtividade(COD_ATIVIDADE);
  }

  @Get('desc/:DESC_ATIVIDADE')
  searchAtividadeByName(@Param('DESC_ATIVIDADE') DESC_ATIVIDADE: string) {
    return this.AtividadesMunicipaisService.searchAtividadeByName(DESC_ATIVIDADE);
  }

  @Post()
  createAtividades(@Body() newAtividade: CreateAtividadesMunicipaisDto) {
    return this.AtividadesMunicipaisService.createAtividades(newAtividade);
  }

  @Delete(':COD_ATIVIDADE')
  deleteAtividade(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string) {
    return this.AtividadesMunicipaisService.deleteAtividade(COD_ATIVIDADE);
  }

  @Patch(':COD_ATIVIDADE')
  updateAtividade(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string, @Body() AtividadeMunicipalEntity: UpdateAtividadesMunicipaisDto) {
    return this.AtividadesMunicipaisService.updateAtividade(COD_ATIVIDADE, AtividadeMunicipalEntity);
  }
}
