import { Controller, Get, Post } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './user.entity';

@Controller('user')
export class userController {
  constructor(private readonly userService: userService) {}

    @Get ('listar')
    async listar(): Promise<user[]>{
        return this.userService.listar()
    }




}

