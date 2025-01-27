import { Module } from '@nestjs/common';
import { WebserviceService } from './webservice.service';
import { WebserviceController } from './webservice.controller';
import { webserviceProviders } from './webservice.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [WebserviceController],
  providers: [
    ...webserviceProviders,
    WebserviceService,
  ],
  exports: [WebserviceService], // Exporta o serviço
})
export class WebserviceModule {}
