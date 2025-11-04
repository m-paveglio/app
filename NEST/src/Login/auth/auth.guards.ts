import { 
  Injectable, 
  CanActivate, 
  ExecutionContext, 
  UnauthorizedException,
  Logger 
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
    private reflector: Reflector, // Para rotas públicas
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Verifica se a rota é pública
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      this.logger.warn(`Requisição sem header de autorização`);
      throw new UnauthorizedException('Token de autorização não fornecido');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      this.logger.warn(`Formato de header inválido`);
      throw new UnauthorizedException('Formato do header de autorização inválido');
    }

    try {
      // Verifica se o token foi revogado
      if (this.authService.isTokenRevoked(token)) {
        this.logger.warn(`Tentativa de uso de token revogado`);
        throw new UnauthorizedException('Token foi revogado. Faça login novamente.');
      }

      // Verifica e decodifica o token
      const decoded = this.jwtService.verify(token);
      
      // Validações adicionais do payload
      if (!decoded.sub) {
        throw new UnauthorizedException('Token inválido: informações ausentes');
      }

      // Verifica se o token não é muito antigo (opcional)
      const tokenAge = Math.floor(Date.now() / 1000) - (decoded.iat || 0);
      const maxAge = 30 * 24 * 60 * 60; // 30 dias
      
      if (tokenAge > maxAge) {
        throw new UnauthorizedException('Token expirado');
      }

      // Anexa as informações do usuário à requisição
      request.user = {
        cpf: decoded.sub,
        iat: decoded.iat,
      };
      
      // Anexa o token para uso em logout
      request.token = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn(`Erro ao validar token: ${error.message}`);
      
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token expirado. Faça login novamente.');
      }
      
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Token inválido');
      }

      throw new UnauthorizedException('Falha na autenticação');
    }
  }
}

/**
 * Decorator para marcar rotas como públicas
 */
import { SetMetadata } from '@nestjs/common';
export const Public = () => SetMetadata('isPublic', true);