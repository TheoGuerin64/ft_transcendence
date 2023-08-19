import { BallService } from './services/ball.service';
import { Game } from './classes/game.class';
import { GameService } from './services/game.service';
import { PlayerService } from './services/player.service';
import { PongService } from './services/pong.service';
import { Server, Socket } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';

import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class PongGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly playerService: PlayerService,
    private readonly gameService: GameService,
    private readonly pongService: PongService,
  ) {}

  @SubscribeMessage('connectGame')
  connect(@ConnectedSocket() socket: Socket, @MessageBody() login: string) {
    this.playerService.connectGame(socket, login);
  }

  @SubscribeMessage('joinNormalQueue')
  joinNormalQueue(@MessageBody() login: string) {
    this.pongService.joinQueue(
      this.server,
      this.playerService,
      this.gameService,
      login,
      'normal',
    );
  }

  @SubscribeMessage('joinCustomQueue')
  joinCustomQueue(@MessageBody() login: string) {
    this.pongService.joinQueue(
      this.server,
      this.playerService,
      this.gameService,
      login,
      'custom',
    );
  }

  @SubscribeMessage('joinGameRoom')
  joinGameRoom(@ConnectedSocket() socket: Socket) {
    this.gameService.joinGameRoom(socket);
  }

  @SubscribeMessage('playerMovement')
  playerMovement(
    @ConnectedSocket() socket: Socket,
    @MessageBody() keycode: string,
  ) {
    this.pongService.playerMovement(
      this.server,
      socket,
      this.playerService,
      this.gameService,
      keycode,
    );
  }

  @SubscribeMessage('changePage')
  changePage(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(
      this.server,
      socket,
      this.playerService,
      this.gameService,
    );
  }

  @SubscribeMessage('disconnecting')
  disconnecting(@ConnectedSocket() socket: Socket) {
    this.pongService.disconnectPlayer(
      this.server,
      socket,
      this.playerService,
      this.gameService,
    );
  }
}

//reset3
