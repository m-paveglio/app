import { Module } from '@nestjs/common';
import { DatabaseModule } from 'BACKEND/src/database/database.module';
import { userProviders } from 'BACKEND/src/user/user.providers';
import { userService } from 'BACKEND/src/user/user.service';
import { userController } from 'BACKEND/src/user/user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [userController],
  providers: [
    ...userProviders,
    userService,
  ],
})
export class userModule {}