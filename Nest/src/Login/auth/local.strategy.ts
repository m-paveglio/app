import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from 'src/login/user/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(@Inject('USER_REPOSITORY')
  private userRepository: Repository<user>,) {
    super();
  }

  async validate(cpf: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({where:{cpf, password}});
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}