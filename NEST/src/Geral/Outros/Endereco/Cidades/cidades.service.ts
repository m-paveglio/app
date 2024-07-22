import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cidades } from './entities/cidade.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class CidadesService {
  constructor(
    @Inject('CIDADES_REPOSITORY')
    private CidadesRepository: Repository<Cidades>,
  ) {}

  getCidades (){
    return this.CidadesRepository.find()
  }

  async getCidade(COD_CIDADE: string): Promise<Cidades | undefined> {
    return this.CidadesRepository.findOne({where:{COD_CIDADE},
    });
  }

    async searchCidadeByName(NOME_CIDADE: string): Promise<Cidades[]> {
      return this.CidadesRepository.find({
        where: {
          NOME_CIDADE: Like(`%${NOME_CIDADE}%`),
        },
      });
    }

}
