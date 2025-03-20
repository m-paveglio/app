import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { ComandasXServicos } from './entities/comandaXservico.entity';
import { CreateComandaXServicoDto } from './dto/create-comandaXservico.dto';
import { UpdateComandaXServicoDto } from './dto/update-comandaXservico.dto';

@Injectable()
export class ComandasXServicoService {
  constructor(
    @Inject('COMANDASSERVICOS_REPOSITORY')
    private ComandasXServicoRepository: Repository<ComandasXServicos>,
  ) {}

  async createComandaXservico(COD_COMANDA: string, dadosServico: CreateComandaXServicoDto): Promise<ComandasXServicos> {
    const novoServico = this.ComandasXServicoRepository.create({
      COD_COMANDA,
      COD_SERVICO: dadosServico.COD_SERVICO,
      CNPJ_PRESTADOR: dadosServico.CNPJ_PRESTADOR,
      VALOR: dadosServico.VALOR,
      QUANTIDADE: dadosServico.QUANTIDADE || 1,
      VALOR_FINAL: dadosServico.VALOR * (dadosServico.QUANTIDADE || 1),
    });
  
    return this.ComandasXServicoRepository.save(novoServico);
  }

  async getComandaXservico(COD_COMANDA: string): Promise<ComandasXServicos[]> {
    const comandaFound = await this.ComandasXServicoRepository.find({
      where: { COD_COMANDA },
    });
  
    if (!comandaFound || comandaFound.length === 0) {
      throw new HttpException('Nenhum serviço encontrado para esta comanda', HttpStatus.NOT_FOUND);
    }
  
    return comandaFound;
  }

  async deleteComandaXservico(COD_COMANDA: string, COD_SERVICO: string) {
    const comandaFound = await this.ComandasXServicoRepository.findOne({
      where: { COD_COMANDA, COD_SERVICO },
    });
  
    if (!comandaFound) {
      throw new HttpException('Serviço não encontrado para esta comanda', HttpStatus.NOT_FOUND);
    }
  
    return this.ComandasXServicoRepository.delete({ COD_COMANDA, COD_SERVICO });
  }

    async updateComandaXservico(COD_COMANDA: string, ComandasDto: UpdateComandaXServicoDto) {
      const ComandaFound = await this.ComandasXServicoRepository.findOne({
        where: {
          COD_COMANDA,
        },
      });
  
      if (!ComandaFound) {
        throw new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND);
      }
  
  
      const updateComanda = Object.assign(ComandaFound, ComandasDto);
      return this.ComandasXServicoRepository.save(updateComanda);
    }
  

    async getComandaCnpjXservico (CNPJ_PRESTADOR: string){
      const ComandaFound = await this.ComandasXServicoRepository.find({
        where:{
          CNPJ_PRESTADOR,
        }
      })

      if (!ComandaFound){
      return new HttpException('Comanda não encontrada', HttpStatus.NOT_FOUND)
      }
      return ComandaFound
    }

  }
