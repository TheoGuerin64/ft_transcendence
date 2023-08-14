import { BallService } from './services/ball.service';
import { GameService } from './services/game.service';
import { MatchPlayedModule } from '../database/matchPlayed.module';
import { Module } from '@nestjs/common';
import { PlayerService } from './services/player.service';
import { PongGateway } from './pong.gateway';
import { PongService } from './services/pong.service';
import { UserModule } from './../../user/user.module';

@Module({
  imports: [MatchPlayedModule, UserModule],
  providers: [
    PongGateway,
    PongService,
    GameService,
    PlayerService,
    BallService,
  ],
})
export class PongModule {}

//reset2
