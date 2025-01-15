import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserEmpresasService } from './user_empresas.service';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';

@Controller('user-empresas')
export class UserEmpresasController {
  constructor(private readonly userEmpresasService: UserEmpresasService) {}

  @Post()
  async createUserEmpresa(@Body() UserEmpresasDto: CreateUserEmpresaDto | CreateUserEmpresaDto[]) {
    return this.userEmpresasService.createUserEmpresa(UserEmpresasDto);
  }

  @Get()
  findAll() {
    return this.userEmpresasService.getUserEmpresas();
  }

  @Get('cpf/:CPF')
  findOneByCpf(@Param('CPF') CPF: string) {
    return this.userEmpresasService.getUserEmpresaCpf(CPF);
  }

  @Get('cnpj/:CNPJ')
  findOneByCnpj(@Param('CNPJ') CNPJ: string) {
    return this.userEmpresasService.getUserEmpresaCnpj(CNPJ);
  }

  @Patch(':CNPJ')
  updateUserEmpresa(@Param('CNPJ') CNPJ: string, @Body() updateUserEmpresaDto: UpdateUserEmpresaDto) {
    return this.userEmpresasService.updateUserEmpresa(CNPJ, updateUserEmpresaDto);
  }

  @Delete(':CNPJ')
  deleteUserEmpresa(@Param('CNPJ') CNPJ: string) {
    return this.userEmpresasService.deleteUserEmpresa(CNPJ);
  }
}
