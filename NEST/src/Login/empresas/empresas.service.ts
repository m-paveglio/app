import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';


@Injectable()
export class EmpresasService {
  constructor(
    @Inject('EMPRESAS_REPOSITORY')
    private empresaRepository: Repository<empresa>,
  ) {}

  //CRIAR USUÁRIO
  async createEmpresa(empresaDto: CreateEmpresaDto) {
    if (!cnpjValidator.isValid(empresaDto.CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ: empresaDto.CNPJ,
      },
    });

    if (empresaFound) {
      throw new HttpException('Empresa já existe', HttpStatus.CONFLICT);
    }

    const newEmpresa = this.empresaRepository.create({
      ...empresaDto,
    });

    return this.empresaRepository.save(newEmpresa);
  }

  getEmpresas() {
    return this.empresaRepository.find();
  }

  //BUSCAR USUÁRIO PELO CPF
  async getEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  //DELETAR USUÁRIO
  async deleteEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.empresaRepository.delete({ CNPJ });
  }

  //EDITAR USUÁRIO
  async updateEmpresa(CNPJ: string, empresaDto: UpdateEmpresaDto) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    const updateEmpresa = Object.assign(empresaFound, empresaDto);
    return this.empresaRepository.save(updateEmpresa);
  }

  //BUSCAR USUÁRIO PELO NOME
  async searchEmpresaByName(NOME: string): Promise<empresa[]> {
    return this.empresaRepository.find({
      where: {
        NOME: Like(`%${NOME}%`),
      },
    });
  }
  

  async salvarCertificado(cnpj: string, certificado: Buffer, senha: string) {
    if (!cnpjValidator.isValid(cnpj)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }
    if (!certificado || !senha) {
      throw new HttpException('Certificado e senha são obrigatórios', HttpStatus.BAD_REQUEST);
    }
    const hashSenha = await bcrypt.hash(senha, 10);
    const existente = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (existente) {
      existente.certificado = certificado;
      existente.senha = hashSenha;
      existente.data_upload = new Date();
      return this.empresaRepository.save(existente);
    }
    const novoCertificado = this.empresaRepository.create({ CNPJ: cnpj, certificado, senha: hashSenha, data_upload: new Date() });
    return this.empresaRepository.save(novoCertificado);
  }

  async obterCertificado(cnpj: string): Promise<{ cnpj: string; certificadoBase64: string; senha: string; data_upload: Date }> {
    const empresa = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (!empresa || !empresa.certificado) {
      throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    }
    return {
      cnpj: empresa.CNPJ,
      certificadoBase64: empresa.certificado.toString('base64'),
      senha: empresa.senha,
      data_upload: empresa.data_upload,
    };
  }

  async removerCertificado(cnpj: string) {
    const empresa = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (!empresa || !empresa.certificado) {
      throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    }
    empresa.certificado = null;
    empresa.senha = null;
    empresa.data_upload = null;
    return this.empresaRepository.save(empresa);
  }
}