import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Empresa_CNAE } from './entities/Empresa-Cnae.entity';
import { CreateEmpresaCnaeDto } from './dto/create-Empresa-Cnae.dto';
import { UpdateEmpresaCnaeDto } from './dto/update-Empresa-Cnae.dto';

@Injectable()
export class EmrpesaCnaeService {
  constructor(
    @Inject('EMPRESACNAE_REPOSITORY')
    private Empresa_CNAERepository: Repository<Empresa_CNAE>,
  ) {}

  async createEmpresaCnae(EmpresaCnaeDto: CreateEmpresaCnaeDto) {
    const EmpresaCnaeFound = await this.Empresa_CNAERepository.findOne({
      where: {
        CNPJ: EmpresaCnaeDto.CNPJ,
      },
    });

     const newEmpresaCnae = this.Empresa_CNAERepository.create({
      ...EmpresaCnaeDto,
    });

    return this.Empresa_CNAERepository.save(newEmpresaCnae);
  }

    getEmpresaCnaes (){
      return this.Empresa_CNAERepository.find()
    }

    async getEmpresaCnae (CNPJ: string){
      const EmpresaCnaeFound = await this.Empresa_CNAERepository.findOne({
        where:{
          CNPJ,
        }
      })

      if (!EmpresaCnaeFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return EmpresaCnaeFound
    }

    async getEmpresaCnaeCnpj (CNPJ: string){
      const EmpresaCnaeFound = await this.Empresa_CNAERepository.find({
        where:{
          CNPJ,
        }
      })

      if (!EmpresaCnaeFound){
      return new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND)
      }
      return EmpresaCnaeFound
    }


    async deleteEmpresaCnae(CNPJ: string, COD_CNAE: string) {
      const EmpresaCnaeFound = await this.Empresa_CNAERepository.findOne({
        where: {
          CNPJ,
          COD_CNAE
        }
      });
    
      if (!EmpresaCnaeFound) {
        return new HttpException('Vínculo Empresa-CNAE não encontrado', HttpStatus.NOT_FOUND);
      }
    
      return this.Empresa_CNAERepository.delete({ CNPJ, COD_CNAE });
    }

    async updateEmpresaCnae(CNPJ: string, EmpresaCnaeDto: UpdateEmpresaCnaeDto) {
      const EmpresaCnaeFound = await this.Empresa_CNAERepository.findOne({
        where: {
          CNPJ,
        },
      });
  
      if (!EmpresaCnaeFound) {
        throw new HttpException('Serviço não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updateServico = Object.assign(EmpresaCnaeFound, EmpresaCnaeDto);
      return this.Empresa_CNAERepository.save(updateServico);
    }
  

  }