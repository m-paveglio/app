import { Controller, Post, Body, Get, Param, Delete, Query } from '@nestjs/common';
import { NfseService } from './nfse.service';

@Controller('nfse')
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}


  @Post('enviar-individual')
  async enviarNfseIndividual(@Body() dados: any) {
    return this.nfseService.gerarNfse(dados);
  }

    @Get('CNPJ/:CNPJ')
    getNFSECnpj(@Param('CNPJ') CNPJ: string) {
      return this.nfseService.getNFSECnpj(CNPJ);
    }

    // Consulta de NFSe com filtros opcionais
  @Get('CNPJ/:CNPJ/buscar')
  buscarNfseComFiltros(
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
    @Query('tomador') tomador?: string,
    @Query('nome') nome?: string,
    @Query('valor') valor?: number,
    @Query('rps') rps?: string,
  ) {
    // Monta um objeto com apenas os filtros fornecidos
    const filtros: any = {};
    if (dataInicio) filtros.dataInicio = dataInicio;
    if (dataFim) filtros.dataFim = dataFim;
    if (tomador) filtros.tomador = tomador;
    if (nome) filtros.nome = nome;
    if (valor) filtros.valor = valor;
    if (rps) filtros.rps = rps;

    return this.nfseService.buscarNfseComFiltros(filtros);
  }
  
  @Delete('limpar')
    async limparTudo() {
      await this.nfseService.limparTodas();
      return { success: true, message: 'Todas as NFSe foram removidas.' };
    }
}
