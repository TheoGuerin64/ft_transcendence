import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { PongService } from './pong.service';
@Module({
  providers: [PongGateway, PongService],
})
export class PongModule {}
