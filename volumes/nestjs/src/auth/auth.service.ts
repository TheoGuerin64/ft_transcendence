import { firstValueFrom } from 'rxjs';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly httpService: HttpService,
  ) {}

  async getData(token: string, endpoint: string): Promise<any> {
    const config = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    };
    const request = this.httpService.get(
      'https://api.intra.42.fr' + endpoint,
      config,
    );
    return (await firstValueFrom(request)).data;
  }

  async register(token: TokenResponse): Promise<User> {
    const data = await this.getData(token.access_token, '/v2/me');
    let user = await this.userService.findOne(data['login']);
    const newToken = {
      access_token: token.access_token,
      refresh_token: token.refresh_token,
    };
    if (user) {
      user = this.userService.update(user, newToken);
    } else {
      user = this.userService.create({
        login: data['login'],
        name: data['login'],
        avatar: data['image']['versions']['medium'],
        ...newToken,
      });
    }
    this.userService.save(user);
    return user;
  }
}
