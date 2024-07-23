import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { user } from '../user/user.entity';
import { cpf } from 'cpf-cnpj-validator';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
    private Jwtservice: JwtService,
  ) {}

  async signIn(CPF: string, SENHA: string): Promise<any> {
    // Garantir que o CPF não tenha espaços extras
    CPF = CPF.trim();


    const user = await this.userRepository.findOne({ where: { CPF } });

    if (!user) {
      throw new UnauthorizedException('USUÁRIO NÃO AUTORIZADDO');
    }

    // Verificar se o campo USER_SIS está correto
    if (user.USER_SIS.trim() !== '1') {
      throw new UnauthorizedException('USUÁRIO NÃO TEM PERMISSÃO');
    }

    // Comparar a senha fornecida com a senha armazenada
    const isMatch = await bcrypt.compare(SENHA, user.SENHA);

    if (!isMatch) {
      throw new UnauthorizedException('SENHA INCORRETA');
    }

    // Gerar e retornar o token JWT
    const payload = { sub: user.CPF };
    return {
      access_token: await this.Jwtservice.signAsync(payload),
    };
  }
}
