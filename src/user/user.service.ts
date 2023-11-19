import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './user.entity';
import { createUserDto } from './dto/create-user-dto';

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

  async listar(): Promise<user[]> {
    return this.userRepository.find();
  }

}