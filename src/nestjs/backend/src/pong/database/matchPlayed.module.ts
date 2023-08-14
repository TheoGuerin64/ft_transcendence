import { MatchPlayed } from './matchPlayed.entity';
import { MatchPlayedService } from './matchPlayed.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  providers: [MatchPlayedService, MatchPlayed],
  imports: [TypeOrmModule.forFeature([MatchPlayed])],
  exports: [MatchPlayedService],
})
export class MatchPlayedModule {}
