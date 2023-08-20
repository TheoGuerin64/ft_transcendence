import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendshipController } from './friendship.controller';
import { Friendship } from './friendship.entity';
import { FriendshipService } from './friendship.service';

@Module({
  imports: [TypeOrmModule.forFeature([Friendship])],
  controllers: [FriendshipController],
  providers: [FriendshipService],
  exports: [FriendshipService],
})
export class FriendshipModule {}
