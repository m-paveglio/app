import { Module } from '@nestjs/common';
import { EmrpesaCnaeService } from './Empresa-Cnae.service';
import { EmpresaCnaeController } from './Empresa-Cnae.controller';
import { DatabaseModule } from 'src/database/database.module';
import { EmpresaCnaeProviders } from './Empresa-Cnae.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [EmpresaCnaeController],
  providers: [
    ...EmpresaCnaeProviders,
    EmrpesaCnaeService,
  ],
})
export class EmpresaCnaeModule {}
