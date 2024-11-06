import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from '../user/entities/user.providers';
import { userService } from '../user/user.service';
import { userController } from '../user/user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [userController],
  providers: [
    ...userProviders,
    userService,
  ],
})
export class userModule {}