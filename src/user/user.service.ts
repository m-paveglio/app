import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { user } from './user.entity';

@Injectable()
export class userService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<user>,
  ) {}

  async listar(): Promise<user[]> {
    return this.userRepository.find();
  }
}