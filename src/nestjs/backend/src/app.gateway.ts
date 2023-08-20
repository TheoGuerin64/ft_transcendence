import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { UserStatus } from './user/user.entity';
import { UserService } from './user/user.service';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway({ cors: ['http://localhost:8080', 'http://127.0.0.1:8080'] })
export class AppGateway {
  private readonly logger = new Logger(AppGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    if (!client.handshake.auth.token) {
      this.logger.error('No token provided');
      client.disconnect(true);
      return;
    }

    const user = await this.authService.validateJwt(
      client.handshake.auth.token,
    );
    if (user) {
      await this.userService.update(user, { status: UserStatus.ONLINE });
    } else {
      this.logger.error("Token doesn't match any user");
      client.disconnect(true);
      return;
    }
  }

  async handleDisconnect(client: Socket) {
    const user = await this.authService.validateJwt(
      client.handshake.auth.token,
    );

    if (user) {
      await this.userService.update(user, { status: UserStatus.OFFLINE });
    }
  }
}
