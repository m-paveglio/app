import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('USER_REPOSITORY')
  private userRepository: Repository<user>,) {
    super();
  }

  async validate(CPF: string, SENHA: string): Promise<any> {
    const user = await this.userRepository.findOne({ where: { CPF } });
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(SENHA, user.SENHA);
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return user;
  }
}