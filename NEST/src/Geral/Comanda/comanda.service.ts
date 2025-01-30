import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Comandas } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';

@Injectable()
export class ComandasService {
  constructor(
    @Inject('COMANDAS_REPOSITORY')
    private ComandasRepository: Repository<Comandas>,
  ) {}

  async createComanda(ComandasDto: CreateComandaDto) {
    const ComandaFound = await this.ComandasRepository.findOne({
      where: {
        COD_COMANDA: ComandasDto.COD_COMANDA,
      },
    });

     const newComanda = this.ComandasRepository.create({
      ...ComandasDto,
    });

    return this.ComandasRepository.save(newComanda);
  }

    getComandas (){
      return this.ComandasRepository.find()
    }

    async getComanda (COD_COMANDA: string){
      const ComandaFound = await this.ComandasRepository.findOne({
        where:{
          COD_COMANDA,
        }
      })

      if (!ComandaFound){
      return new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND)
      }
      return ComandaFound
    }

    async deleteComanda (COD_COMANDA: string){
      const ComandaFound = await this.ComandasRepository.findOne({
        where: {
          COD_COMANDA
        }
      });

      if (!ComandaFound){
        return new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND)
      }

      return this.ComandasRepository.delete({COD_COMANDA})
    }

    async updateComanda(COD_COMANDA: string, ComandasDto: UpdateComandaDto) {
      const ComandaFound = await this.ComandasRepository.findOne({
        where: {
          COD_COMANDA,
        },
      });
  
      if (!ComandaFound) {
        throw new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND);
      }
  
  
      const updateComanda = Object.assign(ComandaFound, ComandasDto);
      return this.ComandasRepository.save(updateComanda);
    }
  

    async searchComandaByName(NOME: string): Promise<Comandas[]> {
      return this.ComandasRepository.find({
        where: {
          NOME: Like(`%${NOME}%`),
        },
      });
    }

    async getComandaCnpj (CNPJ_PRESTADOR: string){
      const ComandaFound = await this.ComandasRepository.find({
        where:{
          CNPJ_PRESTADOR,
        }
      })

      if (!ComandaFound){
      return new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND)
      }
      return ComandaFound
    }

    async getComandaCnpjEmAberto(CNPJ_PRESTADOR: string) {
      return await this.ComandasRepository.find({
        where: {
          CNPJ_PRESTADOR,
          DATA_FINAL: null,
        },
      });
    }
  }
