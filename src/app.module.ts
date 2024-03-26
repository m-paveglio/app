import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { userModule } from './login/user/user.module';
import { AuthModule } from './login/auth/auth.module';

@Module({
  imports: [userModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
