import { Server } from 'socket.io';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: 'http://localhost:8080' })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly userService: UserService) {}
}
