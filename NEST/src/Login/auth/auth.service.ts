import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from 'src/Login/user/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
    private Jwtservice: JwtService,
  ) {}

  async signIn(CPF: string, SENHA: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { CPF } });

    if (!user) {
      throw new UnauthorizedException();
    }

    // Verifique se o usuário possui USER_SIS = 1
    if (Number(user.USER_SIS) !== 1) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(SENHA, user.SENHA);

    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.CPF };

    return {
      access_token: await this.Jwtservice.signAsync(payload),
    };
  }
}
