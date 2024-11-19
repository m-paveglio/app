import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { user } from '../user/entities/user.entity';
import { UserEmpresa } from '../user_empresas/entities/user_empresa.entity';

@Injectable()
export class AuthService {
  private revokedTokens: Set<string> = new Set();

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
    @Inject('USER_EMPRESAS_REPOSITORY')
    private userEmpresasRepository: Repository<UserEmpresa>,
    private Jwtservice: JwtService,
  ) {}

  async signIn(CPF: string, SENHA: string): Promise<any> {
    CPF = CPF.trim();

    // Busca o usuário pelo CPF
    const user = await this.userRepository.findOne({ where: { CPF } });
    if (!user) {
      throw new UnauthorizedException('USUÁRIO NÃO AUTORIZADO');
    }

    // Verificar se o usuário tem permissão na tabela USER_EMPRESAS
    const userEmpresa = await this.userEmpresasRepository.findOne({ where: { CPF } });
    if (!userEmpresa || userEmpresa.USER_STATUS.trim() !== '1') {
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

    // Buscar empresas associadas ao CPF
    const empresas = await this.userEmpresasRepository.find({ where: { CPF } });

    return {
      access_token: accessToken,
      user: {
        nome: user.NOME,
        CPF: user.CPF,
        empresas: empresas.map(emp => ({
          CNPJ: emp.CNPJ,
          COD_PERMISSAO: emp.COD_PERMISSAO,
          USER_STATUS: emp.USER_STATUS,
        })),
      },
    };
  }

  async logout(token: string): Promise<void> {
    this.revokedTokens.add(token);
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
}
