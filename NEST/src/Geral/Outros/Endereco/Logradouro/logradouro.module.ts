import { Module } from '@nestjs/common';
import { LogradouroService } from './logradouro.service';
import { LogradouroController } from './logradouro.controller';
import { logradouroProviders } from './logradouro.providers';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [LogradouroController],
  providers: [
    ...logradouroProviders,
    LogradouroService,
  ],
})
export class LogradouroModule {}
