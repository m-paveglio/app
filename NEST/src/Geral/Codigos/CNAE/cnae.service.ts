import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { CNAE } from './entities/cnae.entity';

@Injectable()
export class CnaeService {
  constructor(
    @Inject('CNAE_REPOSITORY')
    private cnaeRepository: Repository<CNAE>,
  ) {}


    getCnaes (){
      return this.cnaeRepository.find()
    }

    async getCnae (COD_CNAE: string){
      const ServicoFound = await this.cnaeRepository.findOne({
        where:{
          COD_CNAE,
        }
      })

      if (!ServicoFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return ServicoFound
    }


    async searchCnaeByName(DESC_CNAE: string): Promise<CNAE[]> {
      return this.cnaeRepository.find({
        where: {
          DESC_CNAE: Like(`%${DESC_CNAE}%`),
        },
      });
    }

  }