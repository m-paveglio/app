import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { SubstituirNfseService } from './SubstituirNfse.service';

@Controller('nfse')
export class SubstituirNfseController {
  constructor(private readonly substituirNfseService: SubstituirNfseService) {}

  @Post('substituir')
  async substituir(@Body() body: any) {
    try {
      // Chama o service que já vai chamar processarResposta()
      const resultado = await this.substituirNfseService.substituirNfse(body);

      // Se resultado contiver ListaMensagemRetorno → erro de negócio
      if (resultado?.ListaMensagemRetorno) {
        return {
          success: false,
          data: resultado.ListaMensagemRetorno.MensagemRetorno,
          message: 'Erro ao substituir NFS-e',
        };
      }

      // Se não veio nada, trata como erro inesperado
      if (!resultado) {
        throw new HttpException(
          {
            success: false,
            message: 'Nenhuma resposta válida recebida da prefeitura',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Caso de sucesso
      return {
        success: true,
        data: resultado,
        message: 'Substituição processada com sucesso',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Erro interno na substituição',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
