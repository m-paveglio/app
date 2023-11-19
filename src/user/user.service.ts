import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';

@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

    createUser(user: createUserDto){
      const newUser = this.userRepository.create(user)
      return this.userRepository.save(newUser) 
    }

    getUsers (){
      return this.userRepository.find()
    }

    getUser (cpf: string){
      return this.userRepository.findOne({
        where:{
          cpf
        }
      })
    }

    deleteUser (cpf: string){
      return this.userRepository.delete({cpf});
    }

    updateUser (cpf: string, user: updateUserDto){
      return this.userRepository.update({cpf}, user)
    }
}