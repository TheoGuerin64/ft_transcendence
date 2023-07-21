import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './services/auth.service';

@WebSocketGateway({ cors: 'http://localhost:8080' })
export class AppService {
  @WebSocketServer()
  server: Server;

  constructor(private readonly authService: AuthService) {}

  @SubscribeMessage('auth_connect')
  connectionHandler(
    @MessageBody() code: string,
    @ConnectedSocket() client: Socket,
  ): void {
    this.authService.connect(code, client);
  }

}