import { Module } from '@nestjs/common';
import { CnaeService } from './cnae.service';
import { CnaeController } from './cnae.controller';
import { DatabaseModule } from 'src/database/database.module';
import { CnaeProviders } from './cnae.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [CnaeController],
  providers: [
    ...CnaeProviders,
    CnaeService],
})
export class CnaeModule {}
