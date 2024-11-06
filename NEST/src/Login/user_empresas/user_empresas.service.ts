import { Injectable } from '@nestjs/common';
import { CreateUserEmpresaDto } from './dto/create-user_empresa.dto';
import { UpdateUserEmpresaDto } from './dto/update-user_empresa.dto';

@Injectable()
export class UserEmpresasService {
  create(createUserEmpresaDto: CreateUserEmpresaDto) {
    return 'This action adds a new userEmpresa';
  }

  findAll() {
    return `This action returns all userEmpresas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userEmpresa`;
  }

  update(id: number, updateUserEmpresaDto: UpdateUserEmpresaDto) {
    return `This action updates a #${id} userEmpresa`;
  }

  remove(id: number) {
    return `This action removes a #${id} userEmpresa`;
  }
}
