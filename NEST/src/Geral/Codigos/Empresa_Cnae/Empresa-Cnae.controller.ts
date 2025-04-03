import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { EmrpesaCnaeService } from './Empresa-Cnae.service';
import { Empresa_CNAE } from './entities/Empresa-Cnae.entity';
import { CreateEmpresaCnaeDto } from './dto/create-Empresa-Cnae.dto';
import { UpdateEmpresaCnaeDto } from './dto/update-Empresa-Cnae.dto';
@Controller('EMPRESA_CNAE')
export class EmpresaCnaeController {
  constructor(private readonly EmrpesaCnaeService: EmrpesaCnaeService) {}

  @Get()
  getEmpresaCnaes(): Promise<Empresa_CNAE[]> {
    return this.EmrpesaCnaeService.getEmpresaCnaes();
  }


  @Get(':CNPJ')
  getEmpresaCnaeCnpj(@Param('CNPJ') CNPJ: string) {
    return this.EmrpesaCnaeService.getEmpresaCnaeCnpj(CNPJ);
  }

  @Post()
  createEmpresaCnae(@Body() newEmpresaCnae: CreateEmpresaCnaeDto) {
    return this.EmrpesaCnaeService.createEmpresaCnae(newEmpresaCnae);
  }

  @Delete(':CNPJ/:CNAE')
    deleteEmpresaCnae(
      @Param('CNPJ') CNPJ: string,
      @Param('CNAE') CNAE: string
    ) {
      return this.EmrpesaCnaeService.deleteEmpresaCnae(CNPJ, CNAE);
    }

}
