import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { user } from 'src/user/user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';

@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

  async createUser(userDto: createUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        cpf: userDto.cpf,
      },
    });

    if (userFound) {
      throw new HttpException('Usuário já existe', HttpStatus.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

    getUsers (){
      return this.userRepository.find()
    }

    async getUser (cpf: string){
      const userFound = await this.userRepository.findOne({
        where:{
          cpf,
        }
      })

      if (!userFound){
      return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }
      return userFound
    }

    async deleteUser (cpf: string){
      const userFound = await this.userRepository.findOne({
        where: {
          cpf
        }
      });

      if (!userFound){
        return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }

      return this.userRepository.delete({cpf})
    }

    async updateUser(cpf: string, userDto: updateUserDto) {
      const userFound = await this.userRepository.findOne({
        where: {
          cpf,
        },
      });
  
      if (!userFound) {
        throw new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND);
      }
  
      // Adicione aqui a lógica de hash para a senha, se necessário
      if (userDto.password) {
        userDto.password = await bcrypt.hash(userDto.password, 10);
      }
  
      const updatedUser = Object.assign(userFound, userDto);
      return this.userRepository.save(updatedUser);
    }
  

    findByCpf(cpf: string) {
      return this.userRepository.findOne({ where: { cpf } });
    }

    async findOne(cpf: string): Promise<user | undefined> {
      return this.userRepository.findOne({where:{cpf}});}

  }