import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { empresa } from './entities/empresa.entity';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { cnpj as cnpjValidator } from 'cpf-cnpj-validator';


@Injectable()
export class EmpresasService {
  constructor(
    @Inject('EMPRESAS_REPOSITORY')
    private empresaRepository: Repository<empresa>,
  ) {}

  //CRIAR USUÁRIO
  async createEmpresa(empresaDto: CreateEmpresaDto) {
    if (!cnpjValidator.isValid(empresaDto.CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }
  
    const empresaFound = await this.empresaRepository.findOne({
      where: { CNPJ: empresaDto.CNPJ },
    });
  
    if (empresaFound) {
      throw new HttpException('Empresa já existe', HttpStatus.CONFLICT);
    }
  
    const newEmpresa = this.empresaRepository.create({
      CNPJ: empresaDto.CNPJ,
      IM: empresaDto.IM,
      NOME: empresaDto.NOME,
      OPTANTE_SN: empresaDto.OPTANTE_SN,
      AMBIENTE_INTEGRACAO_ID: empresaDto.AMBIENTE_INTEGRACAO_ID // Mapeado corretamente
    });
  
    return this.empresaRepository.save(newEmpresa);
  }

  async getEmpresaComRelacionamento(cnpj: string): Promise<empresa> {
    return this.empresaRepository.findOne({
      where: { CNPJ: cnpj },
      relations: ['AMBIENTE_INTEGRACAO'],
      select: ['CNPJ', 'AMBIENTE_INTEGRACAO_ID']
    });
  }

  getEmpresas() {
    return this.empresaRepository.find();
  }

  //BUSCAR USUÁRIO PELO CPF
  async getEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }
    return empresaFound;
  }

  //DELETAR USUÁRIO
  async deleteEmpresa(CNPJ: string) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      return new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    return this.empresaRepository.delete({ CNPJ });
  }

  //EDITAR USUÁRIO
  async updateEmpresa(CNPJ: string, empresaDto: UpdateEmpresaDto) {
    if (!cnpjValidator.isValid(CNPJ)) {
      throw new HttpException('CPF inválido', HttpStatus.BAD_REQUEST);
    }

    const empresaFound = await this.empresaRepository.findOne({
      where: {
        CNPJ,
      },
    });

    if (!empresaFound) {
      throw new HttpException('Empresa não encontrada', HttpStatus.NOT_FOUND);
    }

    const updateEmpresa = Object.assign(empresaFound, empresaDto);
    return this.empresaRepository.save(updateEmpresa);
  }

  //BUSCAR USUÁRIO PELO NOME
  async searchEmpresaByName(NOME: string): Promise<empresa[]> {
    return this.empresaRepository.find({
      where: {
        NOME: Like(`%${NOME}%`),
      },
    });
  }
  

  async salvarCertificado(cnpj: string, certificado: Buffer, senha: string) {
    if (!cnpjValidator.isValid(cnpj)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }
    if (!certificado || !senha) {
      throw new HttpException('Certificado e senha são obrigatórios', HttpStatus.BAD_REQUEST);
    }
    // Remova o hash da senha - armazene a senha em texto plano (criptografada simetricamente se necessário)
    const existente = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (existente) {
      existente.certificado = certificado;
      existente.senha = senha; // Armazena a senha original
      existente.data_upload = new Date();
      return this.empresaRepository.save(existente);
    }
    const novoCertificado = this.empresaRepository.create({ 
      CNPJ: cnpj, 
      certificado, 
      senha: senha, // Armazena a senha original
      data_upload: new Date() 
    });
    return this.empresaRepository.save(novoCertificado);
  }

  async obterCertificado(cnpj: string): Promise<{ cnpj: string; certificadoBase64: string; senha: string; data_upload: Date }> {
    const empresa = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (!empresa || !empresa.certificado) {
      throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    }
    return {
      cnpj: empresa.CNPJ,
      certificadoBase64: empresa.certificado.toString('base64'),
      senha: empresa.senha,
      data_upload: empresa.data_upload,
    };
  }

  async removerCertificado(cnpj: string) {
    const empresa = await this.empresaRepository.findOne({ where: { CNPJ: cnpj } });
    if (!empresa || !empresa.certificado) {
      throw new HttpException('Certificado não encontrado', HttpStatus.NOT_FOUND);
    }
    empresa.certificado = null;
    empresa.senha = null;
    empresa.data_upload = null;
    return this.empresaRepository.save(empresa);
  }

  async buscarCertificadoPorCnpj(cnpj: string): Promise<{ pfx: Buffer; passphrase: string }> {
    cnpj = cnpj.replace(/\D/g, '');

    if (!cnpjValidator.isValid(cnpj)) {
      throw new HttpException('CNPJ inválido', HttpStatus.BAD_REQUEST);
    }

    const empresa = await this.empresaRepository.findOne({ 
      where: { CNPJ: cnpj },
      select: ['certificado', 'senha']
    });

    if (!empresa) {
      throw new HttpException(`Empresa com CNPJ ${cnpj} não encontrada`, HttpStatus.NOT_FOUND);
    }

    if (!empresa.certificado) {
      throw new HttpException(`Certificado digital não cadastrado para a empresa ${cnpj}`, HttpStatus.NOT_FOUND);
    }

    // Verifica se o certificado já é um Buffer ou precisa ser convertido
    let pfxBuffer: Buffer;
    if (typeof empresa.certificado === 'string') {
      // Se for string, assumimos que está em base64
      pfxBuffer = Buffer.from(empresa.certificado, 'base64');
    } else if (empresa.certificado instanceof Buffer) {
      // Se já for Buffer, usa diretamente
      pfxBuffer = empresa.certificado;
    } else {
      // Outros tipos não são suportados
      throw new HttpException('Formato de certificado inválido', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Verifica se a senha está criptografada
    const isHashed = empresa.senha?.startsWith('$2b$');
    const passphrase = isHashed ? await this.getDecryptedPassphrase(empresa.senha) : empresa.senha;

    return {
      pfx: pfxBuffer,
      passphrase: passphrase || ''
    };
}

  private async getDecryptedPassphrase(hashedPassphrase: string): Promise<string> {
    // Implemente sua lógica para descriptografar a senha se necessário
    // Esta é uma implementação simplificada - ajuste conforme sua segurança
    return hashedPassphrase; // Retornando a senha como está (não recomendado para produção)
  }

}