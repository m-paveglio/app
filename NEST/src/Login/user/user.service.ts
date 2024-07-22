import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { user } from '../user/user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guards';

@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

    //CRIAR USUÁRIO
  async createUser(userDto: createUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        CPF: userDto.CPF,
      },
    });

    if (userFound) {
      throw new HttpException('Usuário já existe', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userDto.SENHA, 10);

    const newUser = this.userRepository.create({
      ...userDto,
      SENHA: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

    @UseGuards(JwtAuthGuard)
    getUsers (){
      return this.userRepository.find()
    }

    //BUSCAR USUÁRIO PELO CPF
    async getUser (CPF: string){
      const userFound = await this.userRepository.findOne({
        where:{
          CPF,
        }
      })

      if (!userFound){
      return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }
      return userFound
    }

    //DELETAR USUÁRIO
    async deleteUser (CPF: string){
      const userFound = await this.userRepository.findOne({
        where: {
          CPF
        }
      });

      if (!userFound){
        return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }

      return this.userRepository.delete({CPF})
    }

    //EDITAR USUÁRIO
    async updateUser(CPF: string, userDto: updateUserDto) {
      const userFound = await this.userRepository.findOne({
        where: {
          CPF,
        },
      });
  
      if (!userFound) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
  
      // Adicione aqui a lógica de hash para a senha, se necessário
      if (userDto.SENHA) {
        userDto.SENHA = await bcrypt.hash(userDto.SENHA, 10);
      }
  
      const updatedUser = Object.assign(userFound, userDto);
      return this.userRepository.save(updatedUser);
    }
  
    //BUSCAR USUÁRIO PELO NOME
    async searchUserByName(nome: string): Promise<user[]> {
      return this.userRepository.find({
        where: {
          NOME: Like(`%${nome}%`),
        },
      });
    }

    //FUNÇÃO PARA EXPORTAR O RELATÓRIO DE USUÁRIOS
    async exportUsersToExcel(): Promise<user[]> {
      return this.userRepository.find();
    }

  }