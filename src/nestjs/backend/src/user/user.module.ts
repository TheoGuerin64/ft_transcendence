import { FriendshipModule } from './friendship/friendship.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { userStatsModule } from 'src/userStats/userStats.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    FriendshipModule,
    userStatsModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
