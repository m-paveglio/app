import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ITEM_LC_116 } from './entities/item_lc_116.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class ItemService {
  constructor(
    @Inject('ITEM_REPOSITORY')
    private ItemRepository: Repository<ITEM_LC_116>,
  ) {}

  getItensLC116 (){
    return this.ItemRepository.find()
  }

  async getItemLC116(COD_ITEM: string): Promise<ITEM_LC_116 | undefined> {
    return this.ItemRepository.findOne({where:{COD_ITEM},
    });
  }

    async searchItemLC116ByName(DESC_ITEM: string): Promise<ITEM_LC_116[]> {
      return this.ItemRepository.find({
        where: {
          DESC_ITEM: Like(`%${DESC_ITEM}%`),
        },
      });
    }

}
