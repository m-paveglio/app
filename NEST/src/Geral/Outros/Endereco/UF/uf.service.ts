import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { UfEntity } from './entities/uf.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class UfService {
  constructor(
    @Inject('UF_REPOSITORY')
    private ufRepository: Repository<UfEntity>,
  ) {}

  getUFs (){
    return this.ufRepository.find()
  }

  async getUF(COD_UF: string): Promise<UfEntity | undefined> {
    return this.ufRepository.findOne({where:{COD_UF},
    });
  }

    async searchUFByName(NOME_DA_UF: string): Promise<UfEntity[]> {
      return this.ufRepository.find({
        where: {
          NOME_DA_UF: Like(`%${NOME_DA_UF}%`),
        },
      });
    }

}
