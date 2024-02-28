import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CepModule } from './cep/cep.module';


@Module({
  imports: [userModule, AuthModule, CepModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
