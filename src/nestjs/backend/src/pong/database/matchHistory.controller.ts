import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { MatchPlayed } from 'src/pong/database/matchPlayed.entity';
import { MatchPlayedService } from 'src/pong/database/matchPlayed.service';

@Controller(' MatchPlayed')
export class MatchPlayedController {
  constructor(private readonly matchPlayedService: MatchPlayedService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async matchPlayed(@Req() req: any): Promise<MatchPlayed[]> {
    return await this.matchPlayedService.find(req.user.login);
  }
}
