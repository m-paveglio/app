import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Permissoes } from './entities/permissoes.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class PermissoesService {
  constructor(
    @Inject('PERMISSOES_REPOSITORY')
    private PermissoesRepository: Repository<Permissoes>,
  ) {}

  getPermissoes (){
    return this.PermissoesRepository.find()
  }

  async getPermissao(COD_PERMISSAO: string): Promise<Permissoes | undefined> {
    return this.PermissoesRepository.findOne({where:{COD_PERMISSAO},
    });
  }

    async searchPermmissaoByName(DESC_PERMISSAO: string): Promise<Permissoes[]> {
      return this.PermissoesRepository.find({
        where: {
          DESC_PERMISSAO: Like(`%${DESC_PERMISSAO}%`),
        },
      });
    }

}
