import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { RpsService } from './rps.service';

@Controller('rps')
export class RpsController {
  constructor(private readonly rpsService: RpsService) {}

  @Post('disponiveis')
  async consultarDisponiveis(@Body() body: { cnpj: string }) {
    try {
      if (!body.cnpj) {
        throw new HttpException('CNPJ é obrigatório', HttpStatus.BAD_REQUEST);
      }

      const rpsDisponiveis = await this.rpsService.consultarRpsDisponiveis(body.cnpj);
      return {
        success: true,
        rpsDisponiveis,
        count: rpsDisponiveis.length
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}