import { Module } from '@nestjs/common';
import { UfService } from './uf.service';
import { UfController } from './uf.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ufProviders } from './uf.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [UfController],
  providers: [
    ...ufProviders,
    UfService,
  ],
})
export class UfModule {}
