import { Body, Controller, Get, Post, Param, Delete, Patch, Res, Inject } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './entities/user.entity'
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';
import { Response } from 'express';
import { Workbook } from 'exceljs';
import { Like, Repository } from 'typeorm';

@Controller('user')
export class userController {
  constructor(private readonly userService: userService, 
  @Inject('USER_REPOSITORY')
  private userRepository: Repository<user>,) {}

  @Get()
  getUsers(): Promise<user[]> {
    return this.userService.getUsers();
  }

  @Get(':cpf')
  getUser(@Param('cpf') cpf: string) {
    return this.userService.getUser(cpf);
  }

  @Get('nome/:nome')
  searchUserByName(@Param('nome') nome: string) {
    return this.userService.searchUserByName(nome);
  }

  @Post()
  createUser(@Body() newUser: createUserDto) {
    return this.userService.createUser(newUser);
  }

  @Delete(':cpf')
  deleteUser(@Param('cpf') cpf: string) {
    return this.userService.deleteUser(cpf);
  }

  @Patch(':cpf')
  updateUser(@Param('cpf') cpf: string, @Body() user: updateUserDto) {
    return this.userService.updateUser(cpf, user);
  }

  @Get('export/excel')
  async exportUsersToExcel(@Res() res: Response) {
    // Supondo que você esteja usando TypeORM
    const Usuarios = await this.userRepository.query(`
      SELECT 
        u.CPF, 
        u.NOME, 
        u.EMAIL, 
        CASE 
          WHEN u.USER_SIS = '1' THEN 'ATIVO' 
          WHEN u.USER_SIS = '0' THEN 'DESATIVADO' 
          ELSE '0' 
        END AS USER_SIS, 
        p.DESC_PERMISSAO AS PERMISSAO
      FROM 
        [user] u
      LEFT JOIN 
        [permissoES] p
      ON 
        u.COD_PERMISSAO = p.COD_PERMISSAO;
    `);
  
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');
  
    worksheet.columns = [
      { header: 'CPF', key: 'CPF', width: 15 },
      { header: 'NOME', key: 'NOME', width: 30 },
      { header: 'EMAIL', key: 'EMAIL', width: 30 },
      { header: 'USER_SIS', key: 'USER_SIS', width: 10 },
      { header: 'PERMISSAO', key: 'PERMISSAO', width: 30 },
    ];
  
    Usuarios.forEach(user => {
      worksheet.addRow({
        CPF: user.CPF,
        NOME: user.NOME,
        EMAIL: user.EMAIL,
        USER_SIS: user.USER_SIS,
        PERMISSAO: user.PERMISSAO,
      });
    });
  
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=users.xlsx');
  
    await workbook.xlsx.write(res);
    res.end();
  }
}