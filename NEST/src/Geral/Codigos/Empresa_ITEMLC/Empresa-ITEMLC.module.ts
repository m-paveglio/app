import { Module } from '@nestjs/common';
import { EmrpesaITEMLCService } from './Empresa-ITEMLC.service';
import { EmpresaITEMLCController } from './Empresa-ITEMLC.controller';
import { DatabaseModule } from 'src/database/database.module';
import { EmpresaITEMLCProviders } from './Empresa-ITEMLC.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [EmpresaITEMLCController],
  providers: [
    ...EmpresaITEMLCProviders,
    EmrpesaITEMLCService,
  ],
})
export class EmpresaITEMLCModule {}
