// src/nfse/nfse.module.ts
import { Module } from '@nestjs/common';
import { NfseService } from './nfse.service';
import { NfseController } from './nfse.controller';

@Module({
  controllers: [NfseController],
  providers: [NfseService],
})
export class nfseModule {}
