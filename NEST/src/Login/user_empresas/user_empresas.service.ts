import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { cpf, cnpj as cnpjValidator } from 'cpf-cnpj-validator';
import { UserEmpresa } from './entities/user_empresa.entity';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';

@Injectable()
export class UserEmpresasService {
  constructor(
    @Inject('USER_EMPRESAS_REPOSITORY')
    private userEmpresaRepository: Repository<UserEmpresa>,
  ) {}

  // Criar usuário-empresa
  async createUserEmpresa(userEmpresasDto: CreateUserEmpresaDto | CreateUserEmpresaDto[]) {
    const userEmpresasArray = Array.isArray(userEmpresasDto) ? userEmpresasDto : [userEmpresasDto];
    const resultados = [];
  
    for (const userEmpresaDto of userEmpresasArray) {
      // Validar CNPJ
      if (!cnpjValidator.isValid(userEmpresaDto.CNPJ)) {
        throw new HttpException(`CNPJ inválido: ${userEmpresaDto.CNPJ}`, HttpStatus.BAD_REQUEST);
      }
  
      // Validar CPF
      if (!cpf.isValid(userEmpresaDto.CPF)) {
        throw new HttpException(`CPF inválido: ${userEmpresaDto.CPF}`, HttpStatus.BAD_REQUEST);
      }
  
      const newUserEmpresa = this.userEmpresaRepository.create({
        ...userEmpresaDto,
      });
  
      const savedEmpresa = await this.userEmpresaRepository.save(newUserEmpresa);
      resultados.push(savedEmpresa);
    }
  
    return resultados.length === 1 ? resultados[0] : resultados;
  }

  // Listar todos os usuários-empresa
  getUserEmpresas() {
    return this.userEmpresaRepository.find();
  }

  // Buscar usuário-empresa pelo CNPJ
  async getUserEmpresaCnpj(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresas = await this.userEmpresaRepository.find({
      where: { CNPJ },
    });

    if (!empresas.length) {
      throw new HttpException('Nenhum usuário-empresa encontrado para o CNPJ fornecido', HttpStatus.NOT_FOUND);
    }

    return empresas;
  }

  // Buscar usuário-empresa pelo CPF
  async getUserEmpresaCpf(CPF: string) {
    // Validar CPF
    if (!cpf.isValid(CPF)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }
  
    // Buscar registros associados ao CPF
    const empresas = await this.userEmpresaRepository.find({
      where: { CPF },
    });
  
    // Retornar array vazio caso não haja vínculos
    return empresas; // Retorna [] se nenhuma empresa for encontrada
  }


  // Atualizar usuário-empresa
  async updateUserEmpresa(CNPJ: string, userEmpresaDto: UpdateUserEmpresaDto) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresa = await this.userEmpresaRepository.findOne({
      where: { CNPJ },
    });

    if (!empresa) {
      throw new HttpException('Usuário-empresa não encontrado', HttpStatus.NOT_FOUND);
    }

    const updatedEmpresa = Object.assign(empresa, userEmpresaDto);
    return this.userEmpresaRepository.save(updatedEmpresa);
  }

  // Deletar usuário-empresa
  async deleteUserEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresas = await this.userEmpresaRepository.find({
      where: { CNPJ },
    });

    if (!empresas.length) {
      throw new HttpException('Nenhum usuário-empresa encontrado para o CNPJ fornecido', HttpStatus.NOT_FOUND);
    }

    return this.userEmpresaRepository.delete({ CNPJ });
  }
}
