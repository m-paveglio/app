import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NfseService } from './nfse.service';
import { NfseController } from './nfse.controller';
import { EmailService } from './common/email.service';
import { XmlUtilsService } from './common/xml-utils.service';
import { WebserviceModule } from './webservice/webservice.module';

@Module({
  imports: [HttpModule, WebserviceModule], // Adicione o WebserviceModule aqui
  controllers: [NfseController],
  providers: [NfseService, EmailService, XmlUtilsService],
})
export class NfseModule {}
