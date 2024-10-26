import { Controller, Post, Body } from '@nestjs/common';
import { NfseService } from './nfse.service';
import { NfseDto } from './nfse.dto';

@Controller('nfs')
export class NfseController {
  constructor(private readonly nfsService: NfseService) {}

  @Post('gerar')
  async gerarNfse(@Body() nfsDto: NfseDto) {
    return this.nfsService.gerarNfse(nfsDto);
  }
}
