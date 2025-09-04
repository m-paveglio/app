import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CancelarNfseController } from './CancelarNfse.controller';
import { CancelarNfseService } from './CancelarNfse.service';
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
  controllers: [CancelarNfseController],
  providers: [CancelarNfseService],
  exports: [CancelarNfseService],
})
export class CancelarNfseModule {}
