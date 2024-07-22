import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { userModule } from '../user/user.module';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from '../user/user.providers';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import {JwtModule} from '@nestjs/jwt'

@Module({
  imports: [userModule, DatabaseModule, PassportModule,
  JwtModule.register({
    global: true,
    secret: jwtConstants.secret,
    signOptions: {expiresIn: '30d'}
  })],
  providers: [AuthService, ...userProviders, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
