import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth-jwt.guard';
import { PublicData, UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any): Promise<PublicData> {
    const user = await this.userService.findOne(req.user.login);
    return this.userService.getPublicData(user);
  }
}
