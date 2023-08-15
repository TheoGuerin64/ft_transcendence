import { Controller, Get } from '@nestjs/common';
import { MatchHistoryService } from './matchHistory.service';
import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';

@Controller('MatchHistory')
export class MatchHistoryController {
  constructor(private readonly matchHistoryService: MatchHistoryService) {}
  @Get()
  async matchPlayed(): Promise<MatchPlayed[]> {
    return await this.matchHistoryService.matchPlayed();
  }
}
