import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserEmpresasService } from './user_empresas.service';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';

@Controller('user-empresas')
export class UserEmpresasController {
  constructor(private readonly userEmpresasService: UserEmpresasService) {}

  @Post()
  create(@Body() createUserEmpresaDto: CreateUserEmpresaDto) {
    return this.userEmpresasService.create(createUserEmpresaDto);
  }

  @Get()
  findAll() {
    return this.userEmpresasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userEmpresasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserEmpresaDto: UpdateUserEmpresaDto) {
    return this.userEmpresasService.update(+id, updateUserEmpresaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userEmpresasService.remove(+id);
  }
}
