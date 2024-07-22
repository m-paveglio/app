import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { ATIVIDADES } from './entities/atividades_municipais.entity';
import { CreateAtividadesMunicipaisDto } from './dto/create-atividades_municipai.dto';
import { UpdateAtividadesMunicipaisDto } from './dto/update-atividades_municipai.dto';

@Injectable()
export class AtividadesMunicipaisService {
  constructor(
    @Inject('ATIVIDADES_MUNICIPAIS_REPOSITORY')
    private AtividadesMunicipaisRepository: Repository<ATIVIDADES>,
  ) {}

  async createAtividades(AtividadesDto: CreateAtividadesMunicipaisDto) {
    const atividadeFound = await this.AtividadesMunicipaisRepository.findOne({
      where: {
        COD_ATIVIDADE: AtividadesDto.COD_ATIVIDADE,
      },
    });

     const newAtividade = this.AtividadesMunicipaisRepository.create({
      ...AtividadesDto,
    });

    return this.AtividadesMunicipaisRepository.save(newAtividade);
  }

    getAtividades (){
      return this.AtividadesMunicipaisRepository.find()
    }

    async getAtividade (COD_ATIVIDADE: string){
      const atividadeFound = await this.AtividadesMunicipaisRepository.findOne({
        where:{
          COD_ATIVIDADE,
        }
      })

      if (!atividadeFound){
      return new HttpException('Profissão não encontrada', HttpStatus.NOT_FOUND)
      }
      return atividadeFound
    }

    async deleteAtividade (COD_ATIVIDADE: string){
      const atividadeFound = await this.AtividadesMunicipaisRepository.findOne({
        where: {
          COD_ATIVIDADE
        }
      });

      if (!atividadeFound){
        return new HttpException('Atividade não encontrada', HttpStatus.NOT_FOUND)
      }

      return this.AtividadesMunicipaisRepository.delete({COD_ATIVIDADE})
    }

    async updateAtividade(COD_ATIVIDADE: string, AtividadesDto: UpdateAtividadesMunicipaisDto) {
      const atividadeFound = await this.AtividadesMunicipaisRepository.findOne({
        where: {
          COD_ATIVIDADE,
        },
      });
  
      if (!atividadeFound) {
        throw new HttpException('Atividade não encontrada', HttpStatus.NOT_FOUND);
      }
  
  
      const updateAtividade = Object.assign(atividadeFound, AtividadesDto);
      return this.AtividadesMunicipaisRepository.save(updateAtividade);
    }
  

    async searchAtividadeByName(DESC_ATIVIDADE: string): Promise<ATIVIDADES[]> {
      return this.AtividadesMunicipaisRepository.find({
        where: {
          DESC_ATIVIDADE: Like(`%${DESC_ATIVIDADE}%`),
        },
      });
    }

  }