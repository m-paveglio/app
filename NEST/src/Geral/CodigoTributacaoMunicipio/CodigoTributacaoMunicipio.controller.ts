import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { CodigoTributacaoMunicipioService } from './CodigoTributacaoMunicipio.service';
import { CodigoTributacaoMunicipio } from './entities/CodigoTributacaoMunicipio.entity';
import { CreateCodigoTributacaoMunicipioDto } from './dto/create-CodigoTributacaoMunicipio.dto';
import { UpdateCodigoTributacaoMunicipioDto } from './dto/update-CodigoTributacaoMunicipio.dto';

@Controller('CodigoTributacaoMunicipio')
export class CodigoTributacaoMunicipioController {
  constructor(private readonly CodigoTributacaoMunicipioService: CodigoTributacaoMunicipioService) {}

  @Get()
  getCodigoTributacaoMunicipios(): Promise<CodigoTributacaoMunicipio[]> {
    return this.CodigoTributacaoMunicipioService.getCodigoTributacaoMunicipios();
  }

   
  @Get(':COD_ATIVIDADE')
  getCodigoTributacaoMunicipio(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string) {
    return this.CodigoTributacaoMunicipioService.getCodigoTributacaoMunicipio(COD_ATIVIDADE);
  }

  @Get('desc/:DESC_ATIVIDADE')
  searchCodigoTributacaoMunicipioByName(@Param('DESC_ATIVIDADE') DESC_ATIVIDADE: string) {
    return this.CodigoTributacaoMunicipioService.searchCodigoTributacaoMunicipioByName(DESC_ATIVIDADE);
  }

  @Post()
  createCodigoTributacaoMunicipio(@Body() newCodigoTributacaoMunicipio: CreateCodigoTributacaoMunicipioDto) {
    return this.CodigoTributacaoMunicipioService.createCodigoTributacaoMunicipio(newCodigoTributacaoMunicipio);
  }

  @Delete(':COD_ATIVIDADE')
  deleteCodigoTributacaoMunicipio(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string) {
    return this.CodigoTributacaoMunicipioService.deleteCodigoTributacaoMunicipio(COD_ATIVIDADE);
  }

  @Patch(':COD_ATIVIDADE')
  updateCodigoTributacaoMunicipio(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string, @Body() CodigoTributacaoMunicipio: UpdateCodigoTributacaoMunicipioDto) {
    return this.CodigoTributacaoMunicipioService.updateCodigoTributacaoMunicipio(COD_ATIVIDADE, CodigoTributacaoMunicipio);
  }
}
