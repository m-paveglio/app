import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Webservice } from './entities/webservice.entity';
import { Repository, Like } from 'typeorm';

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
  async atualizarWebservice(dados: Partial<Webservice>): Promise<Webservice> {
    if (dados.ID) {
      // Atualiza existente
      await this.webserviceRepository.update({ ID: dados.ID }, dados);
      return this.getWebservice(dados.ID);
    } else {
      // Cria novo
      const novo = this.webserviceRepository.create(dados);
      return this.webserviceRepository.save(novo);
    }
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
}