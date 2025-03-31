import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { CodigoTributacaoMunicipio } from './entities/CodigoTributacaoMunicipio.entity';
import { CreateCodigoTributacaoMunicipioDto } from './dto/create-CodigoTributacaoMunicipio.dto';
import { UpdateCodigoTributacaoMunicipioDto } from './dto/update-CodigoTributacaoMunicipio.dto';

@Injectable()
export class CodigoTributacaoMunicipioService {
  constructor(
    @Inject('CODIGOTRIBUTACAOMUNICIPIO_REPOSITORY')
    private CodigoTributacaoMunicipioRepository: Repository<CodigoTributacaoMunicipio>,
  ) {}

  async createCodigoTributacaoMunicipio(CodigoTributacaoMunicipioDto: CreateCodigoTributacaoMunicipioDto) {
    const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
      where: {
        COD_ATIVIDADE: CodigoTributacaoMunicipioDto.COD_ATIVIDADE,
      },
    });

     const newCodigoTributacaoMunicipio = this.CodigoTributacaoMunicipioRepository.create({
      ...CodigoTributacaoMunicipioDto,
    });

    return this.CodigoTributacaoMunicipioRepository.save(newCodigoTributacaoMunicipio);
  }

    getCodigoTributacaoMunicipios (){
      return this.CodigoTributacaoMunicipioRepository.find()
    }

    async getCodigoTributacaoMunicipio (COD_ATIVIDADE: string){
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where:{
          COD_ATIVIDADE,
        }
      })

      if (!CodigoTributacaoMunicipioFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return CodigoTributacaoMunicipioFound
    }

    async deleteCodigoTributacaoMunicipio (COD_ATIVIDADE: string){
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where: {
          COD_ATIVIDADE
        }
      });

      if (!CodigoTributacaoMunicipioFound){
        return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }

      return this.CodigoTributacaoMunicipioRepository.delete({COD_ATIVIDADE})
    }

    async updateCodigoTributacaoMunicipio(COD_ATIVIDADE: string, CodigoTributacaoMunicipioDto: UpdateCodigoTributacaoMunicipioDto) {
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where: {
          COD_ATIVIDADE,
        },
      });
  
      if (!CodigoTributacaoMunicipioFound) {
        throw new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updateCodigoTributacaoMunicipio = Object.assign(CodigoTributacaoMunicipioFound, CodigoTributacaoMunicipioDto);
      return this.CodigoTributacaoMunicipioRepository.save(updateCodigoTributacaoMunicipio);
    }
  

    async searchCodigoTributacaoMunicipioByName(DESC_ATIVIDADE: string): Promise<CodigoTributacaoMunicipio[]> {
      return this.CodigoTributacaoMunicipioRepository.find({
        where: {
          DESC_ATIVIDADE: Like(`%${DESC_ATIVIDADE}%`),
        },
      });
    }

  }