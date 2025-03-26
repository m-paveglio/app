import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { DatabaseModule } from 'src/database/database.module';
import { empresasProviders } from './entities/empresa.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [EmpresasController],
  providers: [ ...empresasProviders,
    EmpresasService,],
    exports: [EmpresasService], // <-- Adicione essa linha
})
export class EmpresasModule {}
