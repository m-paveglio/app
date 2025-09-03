import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConsultarURLController } from './ConsultarURL.controller';
import { ConsultarURLService } from './ConsultarURL.service';
import { EmpresasModule } from 'src/Login/empresas/empresas.module';
import { WebserviceModule } from '../webservice/webservice.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    EmpresasModule,
    WebserviceModule,
  ],
  controllers: [ConsultarURLController],
  providers: [ConsultarURLService],
  exports: [ConsultarURLService],
})
export class ConsultarURLModule {}
