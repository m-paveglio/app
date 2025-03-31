import { Module } from '@nestjs/common';
import { CodigoTributacaoMunicipioService } from './CodigoTributacaoMunicipio.service';
import { CodigoTributacaoMunicipioController } from './CodigoTributacaoMunicipio.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CodigoTributacaoMunicipioProviders } from './CodigoTributacaoMunicipio.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CodigoTributacaoMunicipioController],
  providers: [
    ...CodigoTributacaoMunicipioProviders,
    CodigoTributacaoMunicipioService,
  ],
})
export class CodigoTributacaoMunicipioModule {}
