import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEmpresa } from './entities/user_empresa.entity';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';
import { cpf, cnpj as cnpjValidator } from 'cpf-cnpj-validator';

@Injectable()
export class UserEmpresasService {
  constructor(
    @Inject('USER_EMPRESAS_REPOSITORY')
    private UserEmpresaRepository: Repository<UserEmpresa>,
  ) {}

  //CRIAR user-empresa
  async createUserEmpresa(UserEmpresaDto: CreateUserEmpresaDto) {
    // Validar o CNPJ
    if (!cnpjValidator.isValid(UserEmpresaDto.CNPJ)) {
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
    const newEmpresa = this.UserEmpresaRepository.create(UserEmpresaDto);
  
    return this.UserEmpresaRepository.save(newEmpresa);
  }

  getUserEmpresas() {
    return this.UserEmpresaRepository.find();
  }

  //BUSCAR USUÁRIO PELO CNPJ
  async getUserEmpresaCnpj(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CNPJ },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  //BUSCAR USUÁRIO PELO CPF
  async getUserEmpresaCpf(CPF: string) {
    if (!cpf.isValid(CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CPF },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  //DELETAR USUÁRIO
  async deleteUserEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CNPJ },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.UserEmpresaRepository.delete({ CNPJ });
  }

  //EDITAR USUÁRIO
  async updateUserEmpresa(CNPJ: string, UserEmpresaDto: UpdateUserEmpresaDto) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    if (UserEmpresaDto.CPF && !cpf.isValid(UserEmpresaDto.CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.UserEmpresaRepository.findOne({
      where: { CNPJ },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    const updateEmpresa = Object.assign(empresaFound, UserEmpresaDto);
    return this.UserEmpresaRepository.save(updateEmpresa);
  }
}
