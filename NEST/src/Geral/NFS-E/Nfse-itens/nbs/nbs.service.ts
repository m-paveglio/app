import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Nbs } from './entities/nb.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class NbsService {
  constructor(
    @Inject('NBS_REPOSITORY')
    private NbsRepository: Repository<Nbs>,
  ) {}

  getNbss (){
    return this.NbsRepository.find()
  }

  async getNbs (COD_NBS: string): Promise<Nbs | undefined> {
    return this.NbsRepository.findOne({where:{COD_NBS},
    });
  }

    async searchNbsByName(DESC_NBS: string): Promise<Nbs[]> {
      return this.NbsRepository.find({
        where: {
          DESC_NBS: Like(`%${DESC_NBS}%`),
        },
      });
    }

}
