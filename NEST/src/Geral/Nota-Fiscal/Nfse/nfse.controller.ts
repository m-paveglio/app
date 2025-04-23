import { Controller, Post, Body, Get, Param } from '@nestjs/common';
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
  
  
}
