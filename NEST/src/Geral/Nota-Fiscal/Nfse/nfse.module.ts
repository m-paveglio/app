import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { NfseService } from './nfse.service';
import { NfseController } from './nfse.controller';
import { EmailService } from './common/email.service';
import { XmlUtilsService } from './common/xml-utils.service';
import { DatabaseModule } from 'src/database/database.module';
import { NFSEProviders } from './nfse.providers';
import { EmpresasModule } from 'src/Login/empresas/empresas.module';
import { WebserviceModule } from './webservice/webservice.module';

@Module({
  imports: [HttpModule, DatabaseModule, EmpresasModule, WebserviceModule], // Adicione o WebserviceModule aqui
  controllers: [NfseController],
  providers: [...NFSEProviders, NfseService, EmailService, XmlUtilsService],
})
export class NfseModule {}
