import { MatchPlayed } from './matchPlayed.entity';
import { MatchPlayedController } from './matchPlayed.controller';
import { MatchPlayedService } from './matchPlayed.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([MatchPlayed]), UserModule],
  providers: [MatchPlayedService, MatchPlayed],
  controllers: [MatchPlayedController],
  exports: [MatchPlayedService],
})
export class MatchPlayedModule {}
