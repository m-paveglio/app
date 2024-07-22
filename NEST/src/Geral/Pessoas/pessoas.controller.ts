import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { pessoasService } from './pessoas.service';
import { pessoas } from './pessoas.entity';
import { createPessoasDto } from './dto/create-pessoas-dto';
import { updatePessoasDto } from './dto/update-pessoas-dto';

@Controller('pessoas')
export class pessoasController {
  constructor(private readonly pessoasService: pessoasService) {}


  @Get(':cpf')
  getPessoa(@Param('cpf') cpf: string) {
    return this.pessoasService.getPessoa(cpf);
  }

  @Get('nome/:nome')
  searchpessoaByName(@Param('nome') nome: string) {
    return this.pessoasService.searchPessoasByName(nome);
  }

  @Post()
  createPessoa(@Body() newPessoa: createPessoasDto) {
    return this.pessoasService.createPessoa(newPessoa);
  }

  @Patch(':cpf')
  updatePessoa (@Param('cpf') cpf: string, @Body() pessoas: updatePessoasDto) {
    return this.pessoasService.updatePessoa(cpf, pessoas);
  }
}
