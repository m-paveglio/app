import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Profissoes } from './entities/profissoes.entity';
import { CreateProfissoesDto } from './dto/create-profissoes.dto';
import { UpdateProfissoesDto } from './dto/update-profissoes.dto';

@Injectable()
export class ProfissoesService {
  constructor(
    @Inject('PROFISSOES_REPOSITORY')
    private ProfissoesRepository: Repository<Profissoes>,
  ) {}

  async createProfissao(ProfissaoDto: CreateProfissoesDto) {
    const profissaoFound = await this.ProfissoesRepository.findOne({
      where: {
        COD_PROFISSAO: ProfissaoDto.COD_PROFISSAO,
      },
    });

     const newProfissao = this.ProfissoesRepository.create({
      ...ProfissaoDto,
    });

    return this.ProfissoesRepository.save(newProfissao);
  }

    getProfissoes (){
      return this.ProfissoesRepository.find()
    }

    async getProfissao (COD_PROFISSAO: string){
      const profissaoFound = await this.ProfissoesRepository.findOne({
        where:{
          COD_PROFISSAO,
        }
      })

      if (!profissaoFound){
      return new HttpException('Profissão não encontrada', HttpStatus.NOT_FOUND)
      }
      return profissaoFound
    }

    async deleteProfissao (COD_PROFISSAO: string){
      const profissaoFound = await this.ProfissoesRepository.findOne({
        where: {
          COD_PROFISSAO
        }
      });

      if (!profissaoFound){
        return new HttpException('Profissão não encontrada', HttpStatus.NOT_FOUND)
      }

      return this.ProfissoesRepository.delete({COD_PROFISSAO})
    }

    async updateProfissao(COD_PROFISSAO: string, ProfissaoDto: UpdateProfissoesDto) {
      const profissaoFound = await this.ProfissoesRepository.findOne({
        where: {
          COD_PROFISSAO,
        },
      });
  
      if (!profissaoFound) {
        throw new HttpException('Profissão não encontrada', HttpStatus.NOT_FOUND);
      }
  
  
      const updateProfissao = Object.assign(profissaoFound, ProfissaoDto);
      return this.ProfissoesRepository.save(updateProfissao);
    }
  

    async searchProfissaoByName(DESC_PROFISSAO: string): Promise<Profissoes[]> {
      return this.ProfissoesRepository.find({
        where: {
          DESC_PROFISSAO: Like(`%${DESC_PROFISSAO}%`),
        },
      });
    }

  }