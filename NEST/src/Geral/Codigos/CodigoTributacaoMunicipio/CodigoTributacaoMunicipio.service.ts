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
        CNPJ: CodigoTributacaoMunicipioDto.CNPJ,
        COD_ATIVIDADE: CodigoTributacaoMunicipioDto.COD_ATIVIDADE
      }
    });
  
    if (CodigoTributacaoMunicipioFound) {
      throw new HttpException('Codigo Tributacao Municipio já vinculado a esta empresa', HttpStatus.CONFLICT);
    }
  
    const newCodigoTributacaoMunicipio = this.CodigoTributacaoMunicipioRepository.create({
      ...CodigoTributacaoMunicipioDto,
    });
  
    return this.CodigoTributacaoMunicipioRepository.save(newCodigoTributacaoMunicipio);
  }

    getCodigoTributacaoMunicipios (){
      return this.CodigoTributacaoMunicipioRepository.find()
    }

    async getCodigoTributacaoMunicipio (CNPJ: string){
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where:{
          CNPJ,
        }
      })

      if (!CodigoTributacaoMunicipioFound){
      return new HttpException('Codigo Tributacao Municipio não encontrado', HttpStatus.NOT_FOUND)
      }
      return CodigoTributacaoMunicipioFound
    }

    async getCodigoTributacaoMunicipioCnpj (CNPJ: string){
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.find({
        where:{
          CNPJ,
        }
      });
    
      if (CodigoTributacaoMunicipioFound.length === 0) { // Se array estiver vazio, retorna erro 404
        throw new HttpException('Codigo Tributacao Municipio não encontrado', HttpStatus.NOT_FOUND);
      }
      
      return CodigoTributacaoMunicipioFound;
    }


    async deletCodigoTributacaoMunicipio(CNPJ: string, COD_ATIVIDADE: string) {
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where: {
          CNPJ,
          COD_ATIVIDADE
        }
      });
    
      if (!CodigoTributacaoMunicipioFound) {
        return new HttpException('Codigo Tributacao Municipio não encontrado', HttpStatus.NOT_FOUND);
      }
    
      return this.CodigoTributacaoMunicipioRepository.delete({ CNPJ, COD_ATIVIDADE });
    }

    async updateCodigoTributacaoMunicipio(CNPJ: string, CodigoTributacaoMunicipioDto: UpdateCodigoTributacaoMunicipioDto) {
      const CodigoTributacaoMunicipioFound = await this.CodigoTributacaoMunicipioRepository.findOne({
        where: {
          CNPJ,
        },
      });
  
      if (!CodigoTributacaoMunicipioFound) {
        throw new HttpException('Codigo Tributacao Municipio não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updateCodigoTributacaoMunicipio = Object.assign(CodigoTributacaoMunicipioFound, CodigoTributacaoMunicipioDto);
      return this.CodigoTributacaoMunicipioRepository.save(updateCodigoTributacaoMunicipio);
    }
  
  }