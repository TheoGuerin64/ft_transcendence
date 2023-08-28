import { GameService } from './services/game.service';
import { JwtAuthGuard } from 'src/auth/auth-jwt.guard';
import { PlayerService } from './services/player.service';
import { PongService } from './services/pong.service';
import { Req, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class PongGateway {
  @WebSocketServer()
  server: Server;
  constructor(
    private readonly playerService: PlayerService,
    private readonly pongService: PongService,
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('connectGame')
  async connect(@ConnectedSocket() socket: Socket, @Req() req: any) {
    const user = await this.userService.findOne(req.user.login);
    this.playerService.connectGame(socket, user.login, user.name);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(@ConnectedSocket() socket: Socket) {
    this.pongService.joinQueue(this.server, socket, 'normal');
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinCustomQueue')
  joinCustomQueue(@ConnectedSocket() socket: Socket) {
    this.pongService.joinQueue(this.server, socket, 'custom');
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('leftQueue')
  leftQueue(@ConnectedSocket() socket: Socket) {
    this.playerService.leftQueue(socket);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('joinGameRoom')
  joinGameRoom(@ConnectedSocket() socket: Socket) {
    this.gameService.joinGameRoom(socket);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('playerMovement')
  playerMovement(
    @ConnectedSocket() socket: Socket,
    @MessageBody() dataKey: string,
  ) {
    this.pongService.playerMovement(
      this.server,
      socket,
      dataKey[0],
      dataKey[1],
    );
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('changePage')
  changePage(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(this.server, socket);
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('disconnecting')
  disconnecting(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(this.server, socket);
  }
}
