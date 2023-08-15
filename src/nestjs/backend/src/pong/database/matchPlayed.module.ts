import { MatchPlayed } from './matchPlayed.entity';
import { MatchPlayedService } from './matchPlayed.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [MatchPlayedService, MatchPlayed],
  imports: [TypeOrmModule.forFeature([MatchPlayed]), UserModule],
  exports: [MatchPlayedService],
})
export class MatchPlayedModule {}
