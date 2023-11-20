import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from '../models/UserPayload';
import { UserfromJwt } from "../models/UserfromJwt";
import { user } from 'src/user/user.entity';
import {jwtConstants} from 'src/auth/constants'


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants,
    });
  }

  async validate(payload: UserPayload): Promise<UserfromJwt> {
    return {
      cpf: payload.cpf,
      password: payload.password,
    };
  }
}