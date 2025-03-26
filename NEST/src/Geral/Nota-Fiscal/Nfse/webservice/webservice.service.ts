import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Webservice } from './entities/webservice.entity';
import { Repository, Like } from 'typeorm';
import { CreateWebserviceDto } from './dto/create-webservice.dto';
import { UpdateWebserviceDto } from './dto/update-webservice.dto';

@Injectable()
export class WebserviceService {
  constructor(
    @Inject('WEBSERVICE_REPOSITORY')
    private webserviceRepository: Repository<Webservice>,
  ) {}

  // Retorna todos os webservices cadastrados
  getWebservices() {
    return this.webserviceRepository.find();
  }

  // Busca um webservice específico por ID
  async getWebservice(id: number): Promise<Webservice> {
    const webservice = await this.webserviceRepository.findOne({
      where: { ID: id },
      select: ['ID', 'LINK']
    });
  
    if (!webservice) {
      throw new Error(`Webservice com ID ${id} não encontrado`);
    }
  
    return webservice;
  }

  // Busca webservices por nome da cidade (like)
  async searchWebserviceByName(NOME_CIDADE: string): Promise<Webservice[]> {
    return this.webserviceRepository.find({
      where: {
        NOME_CIDADE: Like(`%${NOME_CIDADE}%`),
      },
    });
  }



  // Método simplificado para buscar o endpoint diretamente pelo ID
  async buscarEndpointPorId(ID: number): Promise<string> {
    const webservice = await this.getWebservice(ID);
    
    if (!webservice.LINK) {
      throw new HttpException(
        `Endpoint não configurado para o webservice ${ID}`,
        HttpStatus.BAD_REQUEST
      );
    }
    
    return webservice.LINK;
  }

  // Cria ou atualiza um webservice
  async atualizarWebservice(id: number, dados: UpdateWebserviceDto): Promise<Webservice> {
    await this.webserviceRepository.update({ ID: id }, dados);
    return this.getWebservice(id);
  }

  // Remove um webservice
  async removerWebservice(ID: number): Promise<void> {
    const result = await this.webserviceRepository.delete(ID);
    
    if (result.affected === 0) {
      throw new HttpException(
        `Webservice com ID ${ID} não encontrado`,
        HttpStatus.NOT_FOUND
      );
    }
  }

  async criarWebservice(dados: CreateWebserviceDto): Promise<Webservice> {
    const novo = this.webserviceRepository.create(dados);
    return this.webserviceRepository.save(novo);
  }

}