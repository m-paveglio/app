import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Logradouro } from './entities/logradouro.entity';
import { CreateLogradouroDto } from './dto/create-logradouro.dto';
import { UpdateLogradouroDto } from './dto/update-logradouro.dto';

@Injectable()
export class LogradouroService {
  constructor(
    @Inject('LOGRADOURO_REPOSITORY')
    private logradouroRepository: Repository<Logradouro>,
  ) {}

  async createLogradouro(logradouroDto: CreateLogradouroDto) {
    const logradouroFound = await this.logradouroRepository.findOne({
      where: {
        CEP: logradouroDto.CEP,
      },
    });

     const newLogradouro = this.logradouroRepository.create({
      ...logradouroDto,
    });

    return this.logradouroRepository.save(newLogradouro);
  }

    getLogradouros (){
      return this.logradouroRepository.find()
    }

    async getLogradouro (CEP: string){
      const logradouroFound = await this.logradouroRepository.findOne({
        where:{
          CEP,
        }
      })

      if (!logradouroFound){
      return new HttpException('CEP não encontrado', HttpStatus.NOT_FOUND)
      }
      return logradouroFound
    }

    async deleteLogradouro (COD_LOGRADOURO: string){
      const logradouroFound = await this.logradouroRepository.findOne({
        where: {
          COD_LOGRADOURO
        }
      });

      if (!logradouroFound){
        return new HttpException('Logradouro não encontrado', HttpStatus.NOT_FOUND)
      }

      return this.logradouroRepository.delete({COD_LOGRADOURO})
    }

    async updateLogradouro(COD_LOGRADOURO: string, logradouroDto: UpdateLogradouroDto) {
      const logradouroFound = await this.logradouroRepository.findOne({
        where: {
          COD_LOGRADOURO,
        },
      });
  
      if (!logradouroFound) {
        throw new HttpException('Logradouro não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updatedLogradouro = Object.assign(logradouroFound, logradouroDto);
      return this.logradouroRepository.save(updatedLogradouro);
    }
  

    async searchLogradouroByName(NOME_DO_LOGRADOURO: string): Promise<Logradouro[]> {
      return this.logradouroRepository.find({
        where: {
          NOME_DO_LOGRADOURO: Like(`%${NOME_DO_LOGRADOURO}%`),
        },
      });
    }

    async getLogradouroCep(CEP: string) {
      // Fazendo a busca do logradouro e unindo os dados de cidade e UF
      const logradouroFound = await this.logradouroRepository
        .createQueryBuilder('logradouro')
        .leftJoinAndSelect('logradouro.cidade', 'cidade') // Relaciona com a tabela de cidades
        .leftJoinAndSelect('cidade.uf', 'uf') // Relaciona com a tabela de UF
        .where('logradouro.CEP = :CEP', { CEP })
        .getOne();
    
      if (!logradouroFound) {
        throw new HttpException('CEP não encontrado', HttpStatus.NOT_FOUND);
      }
    
      return {
        logradouro: logradouroFound.NOME_DO_LOGRADOURO,
        bairro: logradouroFound.BAIRRO,
        cidade: logradouroFound.cidade.NOME_CIDADE,
        uf: logradouroFound.cidade.uf.COD_UF,
        cod_ibge: logradouroFound.cidade.COD_IBGE
      };
    }
    

  }