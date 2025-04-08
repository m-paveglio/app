import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Res,
  Inject,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Repository } from 'typeorm';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import * as forge from 'node-forge';

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
    if (!file) throw new Error('Nenhum arquivo foi enviado');
    if (file.buffer.length < 100) throw new Error('Arquivo de certificado inválido ou corrompido');
    await this.EmpresasService.salvarCertificado(CNPJ, file.buffer, senha);
    return { message: 'Certificado carregado e salvo no banco de dados com sucesso!' };
  }

  @Get(':cnpj')
  async obterCertificado(@Param('cnpj') cnpj: string) {
    const certificado = await this.EmpresasService.obterCertificado(cnpj);
    if (!certificado) throw new Error('Certificado não encontrado');
    return {
      cnpj: certificado.cnpj,
      certificadoBase64: certificado.certificadoBase64,
      senha: certificado.senha,
    };
  }

  @Get(':CNPJ/certificado-info')
  async getCertificadoInfo(@Param('CNPJ') cnpj: string) {
    const empresa = await this.EmpresasService.getEmpresa(cnpj);
    if (!empresa || empresa instanceof HttpException || !empresa.certificado) {
      throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    }

    if (!empresa.senha) {
      throw new HttpException('Senha do certificado não encontrada', HttpStatus.BAD_REQUEST);
    }

    try {
      const p12Der = forge.util.createBuffer(empresa.certificado.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, empresa.senha);
      const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const cert = certBags[forge.pki.oids.certBag][0].cert;

      const subjectAttrs = cert.subject.attributes.map(attr => ({
        name: attr.name,
        value: attr.value,
      }));

      const issuerAttrs = cert.issuer.attributes.map(attr => ({
        name: attr.name,
        value: attr.value,
      }));

      const now = new Date();
      const vencido = now > cert.validity.notAfter;

      return {
        subject: subjectAttrs,
        issuer: issuerAttrs,
        validade: {
          inicio: cert.validity.notBefore,
          fim: cert.validity.notAfter,
          vencido,
        },
        serialNumber: cert.serialNumber,
      };
    } catch (err) {
      throw new HttpException(`Erro ao ler certificado: ${err.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':CNPJ/certificado')
async removerCertificado(@Param('CNPJ') CNPJ: string) {
  try {
    const result = await this.EmpresasService.removerCertificado(CNPJ);
    return { 
      success: true,
      message: 'Certificado removido com sucesso',
      data: result 
    };
  } catch (error) {
    throw new HttpException(
      error.message || 'Erro ao remover certificado',
      error.status || HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
}