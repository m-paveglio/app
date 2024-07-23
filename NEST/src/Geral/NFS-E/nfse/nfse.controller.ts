import { Controller, Post, Body } from '@nestjs/common';
import { NfseService } from './nfse.service';

@Controller('nfse')
export class NfseController {
  constructor(private readonly nfseService: NfseService) {}

  @Post()
  async generateNfse(@Body() nfseData: any) {
    const xml = this.nfseService.generateXml(nfseData);
    const response = await this.nfseService.sendXmlToWebService(xml);
    return response;
  }
}