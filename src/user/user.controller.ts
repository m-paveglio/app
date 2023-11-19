import { Body, Controller, Get, Post } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './user.entity';
import { createUserDto } from './dto/create-user-dto';

@Controller('user')
export class userController {
  constructor(private readonly userService: userService) {}

    @Get ('listar')
    async listar(): Promise<user[]>{
        return this.userService.listar()
    }

    @Post ()
    createUser(@Body() newUser: createUserDto){
      return this.userService.createUser(newUser);
    }

}

