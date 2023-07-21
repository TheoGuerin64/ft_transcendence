import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { Intra42Service, TokenResponse } from '../intra42/intra42.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly intra42Service: Intra42Service,
    private readonly jwtService: JwtService,
  ) {}

  async connect(code: string): Promise<string> {
    const token = await this.intra42Service.getToken(code);
    const user = await this.register(token);
    return await this.jwtService.signAsync({ login: user.login });
  }

  async register(token: TokenResponse): Promise<User> {
    const data = await this.intra42Service.getData(
      token.access_token,
      '/v2/me',
    );
    let user = await this.userService.findOne(data['login']);
    const newToken = {
      token: token.access_token,
      expire_at: Math.floor(Date.now() / 1000) + Number(token.expires_in),
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
