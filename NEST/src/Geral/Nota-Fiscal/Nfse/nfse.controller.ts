import { Controller, Post, Body } from '@nestjs/common';
import { NfseService } from './nfse.service';

@Controller('nfse')
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post('enviar-lote')
  async enviarLoteRps(@Body() dados: any) {
    return this.nfseService.enviarLoteRps(dados);
  }

  @Post('consultar-situacao')
  async consultarSituacao(@Body() dados: { protocolo: string; prestador: any }) {
    return this.nfseService.consultarSituacaoLote(dados.protocolo, dados.prestador);
  }
}
