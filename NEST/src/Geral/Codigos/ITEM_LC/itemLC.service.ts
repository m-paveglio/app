import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { ItemLC } from './entities/itemLC.entity';

@Injectable()
export class ItemLCService {
  constructor(
    @Inject('ITEMLC_REPOSITORY')
    private itemLCRepository: Repository<ItemLC>,
  ) {}


    getItemLCs (){
      return this.itemLCRepository.find()
    }

    async getItemLC (COD_ITEM_LC: string){
      const ServicoFound = await this.itemLCRepository.findOne({
        where:{
          COD_ITEM_LC,
        }
      })

      if (!ServicoFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return ServicoFound
    }


    async searchItemLCByName(DESC_ITEM_LC: string): Promise<ItemLC[]> {
      return this.itemLCRepository.find({
        where: {
          DESC_ITEM_LC: Like(`%${DESC_ITEM_LC}%`),
        },
      });
    }

  }