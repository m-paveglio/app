import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { user } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set(); // Lista de tokens revogados

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
      throw new UnauthorizedException('USUÁRIO NÃO AUTORIZADO');
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
    const accessToken = await this.Jwtservice.signAsync(payload);

    return {
      access_token: accessToken,
      user: {
        nome: user.NOME, // Certifique-se de que o campo 'nome' está presente no modelo de usuário
        CPF: user.CPF,
      },
    };
  }

  async logout(token: string): Promise<void> {
    // Adicionar o token à lista de revogados
    this.revokedTokens.add(token);
  }

  isTokenRevoked(token: string): boolean {
    // Verificar se o token está na lista de revogados
    return this.revokedTokens.has(token);
  }
}
