import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserService } from './user.service';
import { Intra42Service, TokenResponse } from './intra42.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly intra42Service: Intra42Service,
  ) {}

  connect(code: string, client: Socket): void {
    this.intra42Service
      .getToken(code, 'http://127.0.0.1:8080/auth')
      .subscribe((response) => {
        this.register(response.data, client);
      });
  }

  register(token: TokenResponse, client: Socket): void {
    this.intra42Service
      .getData(token.access_token, '/v2/me')
      .subscribe((response) => {
        this.userService.findOne(response.data['login']).then((user) => {
          const data = {
            token: token.access_token,
            expire_at: Date.now() + Number(token.expires_in) * 1000,
            refresh_token: token.refresh_token,
          };
          if (user) {
            this.userService.update(user, data);
            this.userService.save(user);
            client.emit('auth_success', {
              login: user.login,
              name: user.name,
              avatar: response.data['image'].link,
            });
          } else {
            const newUser = this.userService.create({
              login: response.data['login'],
              name: response.data['displayname'],
              avatar: response.data['image'].link,
              ...data,
            });
            this.userService.save(newUser);
            client.emit('auth_success', {
              login: newUser.login,
              name: newUser.name,
              avatar: newUser.avatar,
            });
          }
        });
      });
  }
}
