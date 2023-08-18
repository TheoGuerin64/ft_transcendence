import { Controller, Get } from '@nestjs/common';
import { UserStats } from './userStats.entity';
import { UserStatsService } from './userStats.service';

@Controller('MatchStatistics')
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}
  @Get()
  async findPlayerStats(): Promise<UserStats> {
    return await this.userStatsService.findOne('averdon');
  }
}
