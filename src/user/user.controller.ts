import { Body, Controller, Get, Post, Param} from '@nestjs/common';
import { userService } from './user.service';
import { user } from './user.entity';
import { createUserDto } from './dto/create-user-dto';

@Controller('user')
export class userController {
  constructor(private readonly userService: userService) {}

    @Get ()
    getUsers(): Promise<user[]> {
      return this.userService.getUsers();
    }

    @Get (':cpf')
    getUser(@Param('cpf') cpf: string): Promise<user> {
      console.log (cpf)
      console.log (typeof cpf)
      return this.userService.getUser(cpf);
    }

    @Post ()
    createUser(@Body() newUser: createUserDto): Promise<user>{
      return this.userService.createUser(newUser);
    }

}

