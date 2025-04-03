import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { EmrpesaITEMLCService } from './Empresa-ITEMLC.service';
import { Empresa_ITEMLC } from './entities/Empresa-ITEMLC.entity';
import { CreateEmpresaITEMLCDto } from './dto/create-Empresa-ITEMLC.dto';
@Controller('EMPRESA_ITEMLC')
export class EmpresaITEMLCController {
  constructor(private readonly EmrpesaITEMLCService: EmrpesaITEMLCService) {}

  @Get()
  getEmpresaITEM(): Promise<Empresa_ITEMLC[]> {
    return this.EmrpesaITEMLCService.getEmpresaITEMLCs();
  }


  @Get(':CNPJ')
  getEmpresaITEMLCCnpj(@Param('CNPJ') CNPJ: string) {
    return this.EmrpesaITEMLCService.getEmpresaITEMLCCnpj(CNPJ);
  }

  @Post()
  createEmpresaITEMLC(@Body() newEmpresaITEMLC: CreateEmpresaITEMLCDto) {
    return this.EmrpesaITEMLCService.createEmpresaITEMLC(newEmpresaITEMLC);
  }

  @Delete(':CNPJ/:COD_ITEM_LC')
    deleteEmpresaITEMLC(
      @Param('CNPJ') CNPJ: string,
      @Param('OD_ITEM_LC') COD_ITEM_LC: string
    ) {
      return this.EmrpesaITEMLCService.deleteEmpresaITEMLC(CNPJ, COD_ITEM_LC);
    }

}
