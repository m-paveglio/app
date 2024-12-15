import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Webservice } from './entities/webservice.entity';
import { Repository, Like } from 'typeorm';

@Injectable()
export class WebserviceService {
  constructor(
    @Inject('WEBSERVICE_REPOSITORY')
    private WebserviceRepository: Repository<Webservice>,
  ) {}

  getWebservices (){
    return this.WebserviceRepository.find()
  }

  async getWebservice(ID: string): Promise<Webservice | undefined> {
    return this.WebserviceRepository.findOne({where:{ID},
    });
  }

    async searchWebserviceByName(NOME_CIDADE: string): Promise<Webservice[]> {
      return this.WebserviceRepository.find({
        where: {
          NOME_CIDADE: Like(`%${NOME_CIDADE}%`),
        },
      });
    }

}
