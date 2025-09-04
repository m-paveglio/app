import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SubstituirNfseController } from './SubstituirNfse.controller';
import { SubstituirNfseService } from './SubstituirNfse.service';
import { EmpresasModule } from 'src/Login/empresas/empresas.module';
import { WebserviceModule } from '../../Consultas/webservice/webservice.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    EmpresasModule,
    WebserviceModule,
  ],
  controllers: [SubstituirNfseController],
  providers: [SubstituirNfseService],
  exports: [SubstituirNfseService],
})
export class SubstituirNfseModule {}
