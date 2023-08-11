import { Req, UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtAuthGuard } from './auth/auth-jwt.guard';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: ['http://localhost:8080', 'http://127.0.0.1:8080'] })
export class AppGateway {
  @WebSocketServer()
  server: Server;

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('test')
  handleMessage(@Req() req: any, @MessageBody() data: string): void {
    console.log(data, req.user.login);
  }
}
