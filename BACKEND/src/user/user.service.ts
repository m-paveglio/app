import { Injectable, Inject, HttpException, HttpStatus, UnauthorizedException} from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from 'src/user/user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';
import { CpuInfo } from 'os';

@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

    async createUser(user: createUserDto){
      const userFound = await this.userRepository.findOne({
        where: {
          cpf: user.cpf
        }
      })

      if (userFound){
        return new HttpException('Usuário já existe', HttpStatus.CONFLICT)
      }

      const newUser = this.userRepository.create(user)
      return this.userRepository.save(newUser) 
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

    async updateUser (cpf: string, user: updateUserDto){
      const userFound = await this.userRepository.findOne
      
      if (!userFound) {
        return new HttpException('Usuário não encontrado', HttpStatus.NOT_FOUND)
      }
      
      const updateUser = Object.assign(userFound, user)
      return this.userRepository.save (updateUser);
    }

    findByCpf(cpf: string) {
      return this.userRepository.findOne({ where: { cpf } });
    }

    async findOne(cpf: string): Promise<user | undefined> {
      return this.userRepository.findOne({where:{cpf}});}

  }