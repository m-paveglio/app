import { Body, Controller, Get, Post, Param, Delete, Patch, Res, Inject, UseInterceptors, UploadedFile } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('empresa')
export class EmpresasController {
  constructor(
    private readonly EmpresasService: EmpresasService,
    @Inject('EMPRESAS_REPOSITORY')
    private empresaRepository: Repository<empresa>,
  ) {}

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
  deleteEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.EmpresasService.deleteEmpresa(CNPJ);
  }

  @Patch(':CNPJ')
  updateEmpresa(@Param('CNPJ') CNPJ: string, @Body() empresa: UpdateEmpresaDto) {
    return this.EmpresasService.updateEmpresa(CNPJ, empresa);
  }

  @Post(':CNPJ/upload-certificado')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificado(
    @Param('CNPJ') CNPJ: string,
    @UploadedFile() file: Multer.File,
    @Body('senha') senha: string
  ) {
    if (!file) {
      throw new Error('Nenhum arquivo foi enviado');
    }

  // Chama o service para salvar no banco de dados
  await this.EmpresasService.salvarCertificado(CNPJ, file.buffer, senha);

  return { message: 'Certificado carregado e salvo no banco de dados com sucesso!' };
}

  @Get(':cnpj')
  async obterCertificado(@Param('cnpj') cnpj: string) {
    const certificado = await this.EmpresasService.obterCertificado(cnpj);
    if (!certificado) {
      throw new Error('Certificado não encontrado');
    }

    return {
      cnpj: certificado.cnpj,
      certificadoBase64: certificado.certificadoBase64, // Usando o campo correto
      senha: certificado.senha,
    };
  }
}