import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { userProviders } from './user.providers';
import { userService } from './user.service';
import { userController } from './user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [userController],
  providers: [
    ...userProviders,
    userService,
  ],
})
export class userModule {}