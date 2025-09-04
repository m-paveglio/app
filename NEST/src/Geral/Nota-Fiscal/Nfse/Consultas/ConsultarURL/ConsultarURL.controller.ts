import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ConsultarURLService } from './ConsultarURL.service';

@Controller('nfse')
export class ConsultarURLController {
  constructor(private readonly ConsultarURLService: ConsultarURLService) {}

  @Post('consultarurl')
  async consultar(@Body() body: { cnpj: string; numero: string; serie: string; tipo: number }) {
    try {
      const { cnpj, numero, serie, tipo } = body;

      if (!cnpj || !numero || !serie || tipo === undefined) {
        throw new HttpException(
          'Campos obrigatórios: cnpj, numero, serie, tipo',
          HttpStatus.BAD_REQUEST
        );
      }

      const urls = await this.ConsultarURLService.consultarPdf(cnpj, numero, serie, tipo);
    return {
    success: true,
    urls,
    message: urls ? 'Links encontrados com sucesso' : 'Nenhum link encontrado',
    };
    
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
