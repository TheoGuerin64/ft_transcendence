import { Injectable } from '@nestjs/common';
import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';
import { MatchPlayedService } from 'src/pong/database/matchPlayed.service';

@Injectable()
export class MatchHistoryService {
  constructor(private readonly matchPlayedService: MatchPlayedService) {}
  async matchPlayed(): Promise<MatchPlayed[]> {
    return await this.matchPlayedService.find('averdon');
  }
}
