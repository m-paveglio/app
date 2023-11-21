import { Injectable, Inject, UnauthorizedException} from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from 'src/user/user.entity';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
  constructor(@Inject('USER_REPOSITORY')
  private userRepository: Repository<user>,
  private Jwtservice: JwtService) {}

  async signIn(cpf: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({where:{cpf}});
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    const payload = {sub: user.cpf};
    return {
      access_token: await this.Jwtservice.signAsync(payload)
    }
  }
}