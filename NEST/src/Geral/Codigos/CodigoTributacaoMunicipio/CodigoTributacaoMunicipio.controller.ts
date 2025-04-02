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


  @Get(':CNPJ')
  getCodigoTributacaoMunicipioCnpj(@Param('CNPJ') CNPJ: string) {
    return this.CodigoTributacaoMunicipioService.getCodigoTributacaoMunicipioCnpj(CNPJ);
  }

  @Post()
  createCodigoTributacaoMunicipio(@Body() newCodigoTributacaoMunicipio: CreateCodigoTributacaoMunicipioDto) {
    return this.CodigoTributacaoMunicipioService.createCodigoTributacaoMunicipio(newCodigoTributacaoMunicipio);
  }

  @Delete(':CNPJ/:COD_ATIVIDADE')
    deleteEmpresaCnae(
      @Param('CNPJ') CNPJ: string,
      @Param('COD_ATIVIDADE') COD_ATIVIDADE: string
    ) {
      return this.CodigoTributacaoMunicipioService.deletCodigoTributacaoMunicipio(CNPJ, COD_ATIVIDADE);
    }



  @Patch(':CNPJ/:COD_ATIVIDADE')
  updateCodigoTributacaoMunicipio(@Param('COD_ATIVIDADE') COD_ATIVIDADE: string, @Body() CodigoTributacaoMunicipio: UpdateCodigoTributacaoMunicipioDto) {
    return this.CodigoTributacaoMunicipioService.updateCodigoTributacaoMunicipio(COD_ATIVIDADE, CodigoTributacaoMunicipio);
  }

  
}
