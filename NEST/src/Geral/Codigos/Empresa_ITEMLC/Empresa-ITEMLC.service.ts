import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { Empresa_ITEMLC } from './entities/Empresa-ITEMLC.entity';
import { CreateEmpresaITEMLCDto } from './dto/create-Empresa-ITEMLC.dto';
import { UpdateEmpresaITEMLCDto } from './dto/update-Empresa-ITEMLC.dto';

@Injectable()
export class EmrpesaITEMLCService {
  constructor(
    @Inject('EMPRESAITEMLC_REPOSITORY')
    private Empresa_ITEMLCRepository: Repository<Empresa_ITEMLC>,
  ) {}

  async createEmpresaITEMLC(EmpresaITEMLCDto: CreateEmpresaITEMLCDto) {
    const EmpresaITEMLCFound = await this.Empresa_ITEMLCRepository.findOne({
      where: {
        CNPJ: EmpresaITEMLCDto.CNPJ,
        COD_ITEM_LC: EmpresaITEMLCDto.COD_ITEM_LC
      }
    });
  
    if (EmpresaITEMLCFound) {
      throw new HttpException('ITEMLC já vinculado a esta empresa', HttpStatus.CONFLICT);
    }
  
    const newEmpresaITEMLC = this.Empresa_ITEMLCRepository.create({
      ...EmpresaITEMLCDto,
    });
  
    return this.Empresa_ITEMLCRepository.save(newEmpresaITEMLC);
  }

    getEmpresaITEMLCs (){
      return this.Empresa_ITEMLCRepository.find()
    }

    async getEmpresaITEMLC (CNPJ: string){
      const EmpresaITEMLCFound = await this.Empresa_ITEMLCRepository.findOne({
        where:{
          CNPJ,
        }
      })

      if (!EmpresaITEMLCFound){
      return new HttpException('ITEMLC não encontrado', HttpStatus.NOT_FOUND)
      }
      return EmpresaITEMLCFound
    }

    async getEmpresaITEMLCCnpj (CNPJ: string){
      const EmpresaITEMLCFound = await this.Empresa_ITEMLCRepository.find({
        where:{
          CNPJ,
        }
      });
    
      if (EmpresaITEMLCFound.length === 0) { // Se array estiver vazio, retorna erro 404
        throw new HttpException('ITEM LC não encontrado', HttpStatus.NOT_FOUND);
      }
      
      return EmpresaITEMLCFound;
    }


    async deleteEmpresaITEMLC(CNPJ: string, COD_ITEM_LC: string) {
      const EmpresaITEMLCFound = await this.Empresa_ITEMLCRepository.findOne({
        where: {
          CNPJ,
          COD_ITEM_LC
        }
      });
    
      if (!EmpresaITEMLCFound) {
        return new HttpException('Vínculo Empresa-ITEMLC não encontrado', HttpStatus.NOT_FOUND);
      }
    
      return this.Empresa_ITEMLCRepository.delete({ CNPJ, COD_ITEM_LC });
    }

    async updateEmpresaITEMLC(CNPJ: string, EmpresaITEMLCDto: UpdateEmpresaITEMLCDto) {
      const EmpresaITEMLCFound = await this.Empresa_ITEMLCRepository.findOne({
        where: {
          CNPJ,
        },
      });
  
      if (!EmpresaITEMLCFound) {
        throw new HttpException('ITEMLC não encontrado', HttpStatus.NOT_FOUND);
      }
  
  
      const updateITEMLC = Object.assign(EmpresaITEMLCFound, EmpresaITEMLCDto);
      return this.Empresa_ITEMLCRepository.save(updateITEMLC);
    }
  

  }