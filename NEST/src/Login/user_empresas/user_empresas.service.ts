import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEmpresa } from './entities/user_empresa.entity';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';
import { cpf, cnpj } from 'cpf-cnpj-validator';

@Injectable()
export class UserEmpresasService {
  constructor(
    @Inject('USER_EMPRESAS_REPOSITORY')
    private UserEmpresaRepository: Repository<UserEmpresa>,
  ) {}

  //CRIAR user-empresa
  async createUserEmpresa(UserEmpresaDto: CreateUserEmpresaDto) {
    // Validar o CNPJ
    if (!cnpj.isValid(UserEmpresaDto.CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }
  
    // Validar o CPF
    if (!cpf.isValid(UserEmpresaDto.CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }
  
    // Verificar se a empresa já existe
    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CNPJ: UserEmpresaDto.CNPJ },
    });
  
    if (empresaFound) {
      throw new HttpException('Empresa já existe', HttpStatus.CONFLICT);
    }
  
    // Criar a nova empresa
    const newEmpresa = this.UserEmpresaRepository.create({
      ...UserEmpresaDto,
    });
  
    return this.UserEmpresaRepository.save(newEmpresa);
  }

  getUserEmpresas() {
    return this.UserEmpresaRepository.find();
  }

  //BUSCAR USUÁRIO PELO CPF
  async getUserEmpresaCnpj(CNPJ: string) {
    if (!cnpj.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  async getUserEmpresaCpf(CPF: string) {
    if (!cpf.isValid(CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: {
        CPF,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  //DELETAR USUÁRIO
  async deleteUserEmpresa(CNPJ: string) {
    if (!cnpj.isValid(CNPJ)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.UserEmpresaRepository.delete({ CNPJ });
  }

  //EDITAR USUÁRIO
  async updateUserEmpresa(CNPJ: string, UserEmpresaDto: UpdateUserEmpresaDto) {
    // Validar o CNPJ fornecido para o update
    if (!cnpj.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }
  
    // Validar o CPF, se fornecido no DTO
    if (UserEmpresaDto.CPF && !cpf.isValid(UserEmpresaDto.CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }
  
    // Verificar se a empresa existe
    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CNPJ },
    });
  
    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
  
    // Atualizar os dados da empresa
    const updateEmpresa = Object.assign(empresaFound, UserEmpresaDto);
    return this.UserEmpresaRepository.save(updateEmpresa);
  }
}
