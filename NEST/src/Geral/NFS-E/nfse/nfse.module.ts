import { Module } from '@nestjs/common';
import { NfseController } from './nfse.controller';
import { NfseService } from './nfse.service';

@Module({
  imports: [],
  controllers: [NfseController],
  providers: [NfseService,
  ],
})
export class nfseModule {}