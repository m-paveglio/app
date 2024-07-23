import { Body, Controller, Post, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body('CPF') CPF: string, @Body('SENHA') SENHA: string): Promise<any> {
    return this.authService.signIn(CPF, SENHA);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Request() req): Promise<any> {
    const token = req.headers.authorization?.split(' ')[1]; // Obter o token do header
    if (token) {
      await this.authService.logout(token);
    }
    return { message: 'Logout successful' };
  }
}
