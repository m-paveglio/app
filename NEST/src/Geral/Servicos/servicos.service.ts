import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Servicos } from './entities/servico.entity';
import { CreateServicoDto } from './dto/create-servico.dto';
import { UpdateServicoDto } from './dto/update-servico.dto';

@Injectable()
export class ServicosService {
  constructor(
    @Inject('SERVICOS_REPOSITORY')
    private ServicosRepository: Repository<Servicos>,
  ) {}

  async createServico(ServicosDto: CreateServicoDto) {
    const ServicoFound = await this.ServicosRepository.findOne({
      where: {
        COD_SERVICO: ServicosDto.COD_SERVICO,
      },
    });

     const newServico = this.ServicosRepository.create({
      ...ServicosDto,
    });

    return this.ServicosRepository.save(newServico);
  }

    getServicos (){
      return this.ServicosRepository.find()
    }

    async getServico (COD_SERVICO: string){
      const ServicoFound = await this.ServicosRepository.findOne({
        where:{
          COD_SERVICO,
        }
      })

      if (!ServicoFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return ServicoFound
    }

    async deleteServico (COD_SERVICO: string){
      const ServicoFound = await this.ServicosRepository.findOne({
        where: {
          COD_SERVICO
        }
      });

      if (!ServicoFound){
        return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }

      return this.ServicosRepository.delete({COD_SERVICO})
    }

    async updateServico(COD_SERVICO: string, ServicosDto: UpdateServicoDto) {
      const ServicoFound = await this.ServicosRepository.findOne({
        where: {
          COD_SERVICO,
        },
      });
  
      if (!ServicoFound) {
        throw new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updateServico = Object.assign(ServicoFound, ServicosDto);
      return this.ServicosRepository.save(updateServico);
    }
  

    async searchServicoByName(DESC_SERVICO: string): Promise<Servicos[]> {
      return this.ServicosRepository.find({
        where: {
          DESC_SERVICO: Like(`%${DESC_SERVICO}%`),
        },
      });
    }

  }