import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RpsController } from './rps.controller';
import { RpsService } from './rps.service';
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
  controllers: [RpsController],
  providers: [RpsService],
  exports: [RpsService],
})
export class RpsModule {}