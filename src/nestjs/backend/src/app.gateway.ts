import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { UserStatus } from './user/user.entity';
import { UserService } from './user/user.service';
import {
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: ['http://localhost:8080', 'http://127.0.0.1:8080'] })
export class AppGateway {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const user = await this.authService.validateJwt(
      client.handshake.auth.token,
    );
    if (user) {
      this.userService.update(user, { status: UserStatus.online });
    } else {
      throw new WsException('Invalid token');
    }
  }

  async handleDisconnect(client: Socket) {
    const user = await this.authService.validateJwt(
      client.handshake.auth.token,
    );
    if (user) {
      this.userService.update(user, { status: UserStatus.offline });
    } else {
      throw new WsException('Invalid token');
    }
  }
}
