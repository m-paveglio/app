import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userModule } from 'src/user/user.module';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from 'src/user/user.providers';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';


@Module({
  imports: [userModule, DatabaseModule, PassportModule],
  providers: [AuthService, ...userProviders, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
