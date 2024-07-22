import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Cnae } from './entities/cnae.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class CnaeService {
  constructor(
    @Inject('CNAE_REPOSITORY')
    private CnaeRepository: Repository<Cnae>,
  ) {}

  getCnaes (){
    return this.CnaeRepository.find()
  }

  async getCnae (COD_CNAE: string): Promise<Cnae | undefined> {
    return this.CnaeRepository.findOne({where:{COD_CNAE},
    });
  }

    async searchCnaeByName(DESC_CNAE: string): Promise<Cnae[]> {
      return this.CnaeRepository.find({
        where: {
          DESC_CNAE: Like(`%${DESC_CNAE}%`),
        },
      });
    }

}
