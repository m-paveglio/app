import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CancelarNfseService } from './CancelarNfse.service';

@Controller('nfse')
export class CancelarNfseController {
  constructor(private readonly cancelarNfseService: CancelarNfseService) {}

  @Post('cancelar')
  async cancelar(@Body() body: {
    cnpj: string;
    numero: string;
    inscricaoMunicipal: string;
    codigoMunicipio: string;
    codigoCancelamento: number;
  }) {
    try {
      const { cnpj, numero, inscricaoMunicipal, codigoMunicipio, codigoCancelamento } = body;

      if (!cnpj || !numero || !inscricaoMunicipal || !codigoMunicipio || codigoCancelamento === undefined) {
        throw new HttpException(
          'Campos obrigatórios: cnpj, numero, inscricaoMunicipal, codigoMunicipio, codigoCancelamento',
          HttpStatus.BAD_REQUEST,
        );
      }

      const respostaPrefeitura = await this.cancelarNfseService.cancelarNfse(
        cnpj,
        numero,
        inscricaoMunicipal,
        codigoMunicipio,
        codigoCancelamento,
      );

      return {
        success: true,
        data: respostaPrefeitura,
        message: 'Cancelamento processado com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno no cancelamento',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
