import { Body, Controller, Get, Post, Param, Delete, Patch, Query } from '@nestjs/common';
import { userService } from './user.service';
import { user } from './user.entity';
import { createUserDto } from './dto/create-user-dto';
import { updateUserDto } from './dto/update-user-dto';

@Controller('user')
export class userController {
  constructor(private readonly userService: userService) {}

  @Get()
  getUsers(): Promise<user[]> {
    return this.userService.getUsers();
  }

  @Get(':cpf')
  getUser(@Param('cpf') cpf: string) {
    return this.userService.getUser(cpf);
  }

  @Get(':nome')
  searchUser(@Query('name') name: string) {
    return this.userService.searchUserByName(name);
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
}
