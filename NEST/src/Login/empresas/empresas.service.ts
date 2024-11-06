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

}
