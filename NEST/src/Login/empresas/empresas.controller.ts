import { Body, Controller, Get, Post, Param, Delete, Patch, Res, Inject } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Repository } from 'typeorm';

@Controller('empresa')
export class EmpresasController {
  constructor(private readonly EmpresasService: EmpresasService, 
  @Inject('EMPRESAS_REPOSITORY')
  private empresaRepository: Repository<empresa>,) {}

  @Get()
  getEmpresas(): Promise<empresa[]> {
    return this.EmpresasService.getEmpresas();
  }

  @Get(':CNPJ')
  getEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.EmpresasService.getEmpresa(CNPJ);
  }

  @Get('nome/:NOME')
  searchEmpresaByName(@Param('NOME') NOME: string) {
    return this.EmpresasService.searchEmpresaByName(NOME);
  }

  @Post()
  createEmpresa(@Body() newEmpresa: CreateEmpresaDto) {
    return this.EmpresasService.createEmpresa(newEmpresa);
  }

  @Delete(':CNPJ')
  deleteEmpresa(@Param('CNPJ') cpf: string) {
    return this.EmpresasService.deleteEmpresa(cpf);
  }

  @Patch(':CNPJ')
  updateEmpresa(@Param('CNPJ') CNPJ: string, @Body() empresa: UpdateEmpresaDto) {
    return this.EmpresasService.updateEmpresa(CNPJ, empresa);
  }
}