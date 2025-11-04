import { 
  Injectable, 
  UnauthorizedException, 
  Inject,
  Logger,
  BadRequestException 
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { user } from '../user/entities/user.entity';
import { UserEmpresa } from '../user_empresas/entities/user_empresa.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  // Armazenamento temporário - DEVE ser substituído por Redis em produção
  private revokedTokens: Set<string> = new Set();
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutos

  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
    @Inject('USER_EMPRESAS_REPOSITORY')
    private userEmpresasRepository: Repository<UserEmpresa>,
    private jwtService: JwtService,
    private configService: ConfigService, // Para variáveis de ambiente
  ) {}

  /**
   * Valida CPF format (básico)
   */
  private isValidCPF(cpf: string): boolean {
    const cleanCPF = cpf.replace(/\D/g, '');
    return cleanCPF.length === 11 && /^\d+$/.test(cleanCPF);
  }

  /**
   * Verifica rate limiting de tentativas de login
   */
  private checkRateLimit(cpf: string): void {
    const attempts = this.loginAttempts.get(cpf);
    
    if (attempts) {
      const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();
      
      if (attempts.count >= this.MAX_LOGIN_ATTEMPTS) {
        if (timeSinceLastAttempt < this.LOCKOUT_DURATION) {
          const remainingTime = Math.ceil(
            (this.LOCKOUT_DURATION - timeSinceLastAttempt) / 1000 / 60
          );
          
          this.logger.warn(`Login bloqueado para CPF: ${cpf.substring(0, 3)}***`);
          throw new UnauthorizedException(
            `Muitas tentativas de login. Tente novamente em ${remainingTime} minutos.`
          );
        }
        // Reset após lockout period
        this.loginAttempts.delete(cpf);
      }
    }
  }

  /**
   * Registra tentativa de login
   */
  private recordLoginAttempt(cpf: string, success: boolean): void {
    if (success) {
      this.loginAttempts.delete(cpf);
      return;
    }

    const attempts = this.loginAttempts.get(cpf) || { count: 0, lastAttempt: new Date() };
    attempts.count += 1;
    attempts.lastAttempt = new Date();
    this.loginAttempts.set(cpf, attempts);
  }

  async signIn(CPF: string, SENHA: string): Promise<any> {
    try {
      // Validações de entrada
      if (!CPF || !SENHA) {
        throw new BadRequestException('CPF e senha são obrigatórios');
      }

      CPF = CPF.trim().replace(/\D/g, ''); // Remove caracteres não numéricos

      if (!this.isValidCPF(CPF)) {
        this.logger.warn(`Tentativa de login com CPF inválido: ${CPF.substring(0, 3)}***`);
        throw new BadRequestException('CPF inválido');
      }

      // Verifica rate limiting
      this.checkRateLimit(CPF);

      // Busca o usuário pelo CPF
      const user = await this.userRepository.findOne({ 
        where: { CPF },
        select: ['CPF', 'NOME', 'SENHA'] // Seleciona apenas campos necessários
      });

      if (!user) {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Tentativa de login com CPF não encontrado: ${CPF.substring(0, 3)}***`);
        // Mensagem genérica para não revelar se o usuário existe
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Verificar permissão na tabela USER_EMPRESAS
      const userEmpresa = await this.userEmpresasRepository.findOne({ 
        where: { CPF } 
      });

      if (!userEmpresa || userEmpresa.USER_STATUS.trim() !== '1') {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Usuário sem permissão tentou login: ${CPF.substring(0, 3)}***`);
        throw new UnauthorizedException('Usuário não tem permissão de acesso');
      }

      // Comparar senha com timing-attack protection (bcrypt já faz isso)
      const isMatch = await bcrypt.compare(SENHA, user.SENHA);
      
      if (!isMatch) {
        this.recordLoginAttempt(CPF, false);
        this.logger.warn(`Senha incorreta para CPF: ${CPF.substring(0, 3)}***`);
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Login bem-sucedido
      this.recordLoginAttempt(CPF, true);
      this.logger.log(`Login bem-sucedido: ${CPF.substring(0, 3)}***`);

      // Gerar token JWT com informações mínimas
      const payload = { 
        sub: user.CPF,
        type: 'access',
        iat: Math.floor(Date.now() / 1000)
      };
      
      const accessToken = await this.jwtService.signAsync(payload);

      // Buscar empresas associadas
      const empresas = await this.userEmpresasRepository.find({ 
        where: { CPF },
        select: ['CNPJ', 'COD_PERMISSAO', 'USER_STATUS']
      });

      return {
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 30 * 24 * 60 * 60, // 30 dias em segundos
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
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`Erro no login: ${error.message}`, error.stack);
      throw new UnauthorizedException('Erro ao processar login');
    }
  }

  async logout(token: string): Promise<void> {
    try {
      // Verifica se o token é válido antes de revogar
      const decoded = this.jwtService.verify(token);
      
      // Adiciona à lista de revogados
      this.revokedTokens.add(token);
      
      this.logger.log(`Token revogado para CPF: ${decoded.sub?.substring(0, 3)}***`);
      
      // Limpa tokens expirados periodicamente (implementar um cron job)
      this.cleanupExpiredTokens();
    } catch (error) {
      this.logger.warn(`Tentativa de revogar token inválido`);
      throw new UnauthorizedException('Token inválido');
    }
  }

  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }

  /**
   * Remove tokens expirados do Set (deve ser executado periodicamente)
   */
  private cleanupExpiredTokens(): void {
    // Implementar lógica para remover tokens expirados
    // Em produção, usar Redis com TTL automático
    if (this.revokedTokens.size > 10000) {
      this.logger.warn('Set de tokens revogados muito grande. Considere usar Redis.');
    }
  }

  /**
   * Valida se o token ainda é válido (não revogado e não expirado)
   */
  async validateToken(token: string): Promise<any> {
    try {
      if (this.isTokenRevoked(token)) {
        throw new UnauthorizedException('Token foi revogado');
      }

      const decoded = this.jwtService.verify(token);
      
      // Verifica se o usuário ainda existe e está ativo
      const user = await this.userRepository.findOne({ 
        where: { CPF: decoded.sub } 
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const userEmpresa = await this.userEmpresasRepository.findOne({ 
        where: { CPF: decoded.sub } 
      });

      if (!userEmpresa || userEmpresa.USER_STATUS.trim() !== '1') {
        throw new UnauthorizedException('Usuário não tem mais permissão');
      }

      return decoded;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}