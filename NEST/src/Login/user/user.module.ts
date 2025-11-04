// user.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { userProviders } from '../user/entities/user.providers';
import { userService } from '../user/user.service';
import { userController } from '../user/user.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    forwardRef(() => AuthModule), // ✅ quebrar ciclo
  ],
  controllers: [userController],
  providers: [
    ...userProviders,
    userService,
  ],
  exports: [userService],
})
export class userModule {}
