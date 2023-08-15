import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserService } from './user/user.service';
import { UserStatus } from './user/user.entity';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(private readonly userService: UserService) {}

  async onApplicationBootstrap(): Promise<void> {
    const chris = await this.userService.findOne('ccelaya');
    if (!chris) {
      this.userService.create({
        login: 'ccelaya',
        name: 'Chris',
        status: UserStatus.ONLINE,
        avatar:
          'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQg48rLPIxwM1TVtju1yN0RvAY4HyVQZsbTPIQ7hZGAUfpKV0ZG',
      });
    }
  }
}
