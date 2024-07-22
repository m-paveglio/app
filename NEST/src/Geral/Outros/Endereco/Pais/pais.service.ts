import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { PaisEntity } from './entities/pai.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class PaisService {
  constructor(
    @Inject('PAIS_REPOSITORY')
    private paisRepository: Repository<PaisEntity>,
  ) {}

  getPaises (){
    return this.paisRepository.find()
  }

  async getPais(ID_PAIS: string): Promise<PaisEntity | undefined> {
    return this.paisRepository.findOne({where:{ID_PAIS},
    });
  }

    async searchPaisByName(NOME_PAIS: string): Promise<PaisEntity[]> {
      return this.paisRepository.find({
        where: {
          NOME_PAIS: Like(`%${NOME_PAIS}%`),
        },
      });
    }

}
