import { Controller, Get } from '@nestjs/common';
import { ClientUser } from './user.service';

@Controller('user')
export class userController {
  constructor() {
    // EMPTY
  }

  @Get('me')
  async getAuth(): Promise<ClientUser> {
    return {
      login: 'test',
      name: 'test',
      avatar: 'test',
    };
  }
}
