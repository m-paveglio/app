import { Injectable, Inject, UnauthorizedException} from '@nestjs/common';
import { Any, Repository } from 'typeorm';
import { user } from 'src/user/user.entity';


@Injectable()
export class AuthService {
  constructor(@Inject('USER_REPOSITORY')
  private userRepository: Repository<user>,) {}

  async signIn(cpf: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({where:{cpf}});
    if (user?.password !== password) {
      throw new UnauthorizedException();
    }
    return 'login efetuado!';
  }
}