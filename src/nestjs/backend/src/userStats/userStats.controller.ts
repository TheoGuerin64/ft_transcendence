import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { UserStats } from './userStats.entity';
import { UserStatsService } from './userStats.service';

@Controller('MatchStatistics')
export class UserStatsController {
  constructor(private readonly userStatsService: UserStatsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPlayerStats(@Req() req: any): Promise<UserStats> {
    return await this.userStatsService.findOne(req.user.login);
  }
}
