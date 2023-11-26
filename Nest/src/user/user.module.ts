import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from 'src/user/user.providers';
import { userService } from 'src/user/user.service';
import { userController } from 'src/user/user.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [userController],
  providers: [
    ...userProviders,
    userService,
  ],
})
export class userModule {}