import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { pessoas } from './pessoas.entity';
import { createPessoasDto } from './dto/create-pessoas-dto';
import { updatePessoasDto } from './dto/update-pessoas-dto';

@Injectable()
export class pessoasService {
  constructor(
    @Inject('PESSOAS_REPOSITORY')
    private pessoasRepository: Repository<pessoas>,
  ) {}

  async createPessoa(pessoasDto: createPessoasDto) {
    const pessoaFound = await this.pessoasRepository.findOne({
      where: {
        CPF_CNPJ: pessoasDto.CPF,
      },
    });

    if (pessoaFound) {
      throw new HttpException('Usuário já existe', HttpStatus.CONFLICT);
    }

    const newPessoa = this.pessoasRepository.create({
      ...pessoasDto,
    });

    return this.pessoasRepository.save(newPessoa);
  }

    async getPessoa (CPF_CNPJ: string){
      const pessoaFound = await this.pessoasRepository.findOne({
        where:{
          CPF_CNPJ,
        }
      })

      if (!pessoaFound){
      return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }
      return pessoaFound
    }

    async updatePessoa(CPF_CNPJ: string, userDto: updatePessoasDto) {
      const pessoaFound = await this.pessoasRepository.findOne({
        where: {
          CPF_CNPJ,
        },
      });
  
      if (!pessoaFound) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updatedPessoas = Object.assign(pessoaFound, userDto);
      return this.pessoasRepository.save(updatedPessoas);
    }
  
    async searchPessoasByName(nome: string): Promise<pessoas[]> {
      return this.pessoasRepository.find({
        where: {
          NOME: Like(`%${nome}%`),
        },
      });
    }

  }