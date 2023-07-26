import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientUser } from './user.service';

@Controller('user')
export class userController {
  constructor() {
    // EMPTY
  }

  @Get('me')
  @UseGuards(AuthGuard('oauth2'))
  getAuth(@Request() req: any): ClientUser {
    return {
      login: req.user.login,
      name: req.user.name,
      avatar: req.user.avatar,
    };
  }
}
