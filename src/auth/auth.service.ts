import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UnauthorizedError } from './errors/unauthorized.error';
import { user } from 'src/user/user.entity';
import { userService } from 'src/user/user.service';
import { UserPayload } from './models/UserPayload';
import { UserToken } from './models/UserToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: userService,
  ) {}

  async login(user: user): Promise<UserToken> {
    const payload: UserPayload = {
      cpf: user.cpf,
      password: user.password,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(cpf: string, password: string){
    const user = await this.userService.findByCpf(cpf);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }

    throw new UnauthorizedError(
      'Email address or password provided is incorrect.',
    );
  }
}