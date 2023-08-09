import { Ball } from './ball.service';
import { Game } from './game.service';
import { Globals } from './globals.service';
import { Injectable } from '@nestjs/common';
import { Player } from './player.service';
import { Server, Socket } from 'socket.io';
@Injectable()
export class PongService {
  Players: Player[] = [];
  PlayersQueue: Player[] = [];
  Games: Game[] = [];
  Globals: Globals = new Globals();

  connect(socket: Socket, login: string): void {
    const player = this.Players.find((element) => element.getLogin() === login);
    if (player !== undefined) {
      return;
    }
    const newPlayer = new Player(login, socket.id);
    this.Players.push(newPlayer);
  }

  joinQueue(server: Server, login: string): void {
    const player = this.Players.find((element) => element.getLogin() === login);
    if (player === undefined) {
      return;
    }
    if (this.PlayersQueue.length < 1) {
      this.PlayersQueue.push(player);
    } else {
      this.startGame(server, player);
    }
  }
  startGame(server: Server, playerOne: Player): void {
    const playerTwo = this.PlayersQueue.pop();
    const newGame = new Game('game', playerOne, playerTwo);
    this.Games.push(newGame);
    server
      .in(playerOne.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    server
      .in(playerTwo.getSocketID())
      .emit('findGame', playerOne.getLogin(), playerTwo.getLogin());
    this.ballMovement(server, newGame);
  }

  joinGameRoom(socket: Socket): void {
    const game = this.Games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game !== undefined) {
      socket.join(game.getGameID());
    }
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async ballMovement(server: Server, game: Game): Promise<void> {
    while (true) {
      await this.sleep(15);
      this.newBallPosition(server, game);
      server
        .in(game.getGameID())
        .emit(
          'ballMovement',
          game.getBall().getPositionX(),
          game.getBall().getPositionY(),
        );
    }
  }

  newBallPosition(server: Server, game: Game): void {
    const ball = game.getBall();

    let newPosX = ball.getPositionX() + ball.getDirectionX() * ball.getSpeed();
    let newPosY = ball.getPositionY() + ball.getDirectionY() * ball.getSpeed();

    if (
      newPosY <= -this.Globals.ballCollision ||
      newPosY >= this.Globals.ballCollision
    ) {
      ball.setDirectionY(-ball.getDirectionY());
      newPosY = this.adaptNewPosition(newPosY);
    }
    if (
      newPosX <= -this.Globals.ballCollision ||
      newPosX >= this.Globals.ballCollision
    ) {
      if (this.ballHitPaddle(newPosX, newPosY, game)) {
        ball.setDirectionX(-ball.getDirectionX());
        newPosX = this.adaptNewPosition(newPosX);
      } else {
        this.someoneWinPoint(server, game, newPosX);
        game.setBall(new Ball());
      }
    }

    ball.setPositionX(newPosX);
    ball.setPositionY(newPosY);
  }

  ballHitPaddle(newPosX: number, newPosY: number, game: Game): boolean {
    if (
      (newPosX <= -this.Globals.ballCollision &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerOne())) ||
      (newPosX >= this.Globals.ballCollision &&
        this.ballAtPlayerHeight(newPosY, game.getPlayerTwo()))
    ) {
      return true;
    } else {
      return false;
    }
  }

  ballAtPlayerHeight(newPosY: number, player: Player): boolean {
    if (
      newPosY >= player.getPosY() - this.Globals.heightPlayer / 2 &&
      newPosY <= player.getPosY() + this.Globals.heightPlayer / 2
    ) {
      return true;
    } else {
      return false;
    }
  }

  someoneWinPoint(server: Server, game: Game, newPosX: number): void {
    if (newPosX <= -this.Globals.ballCollision) {
      this.emitWinnerPoint(
        server,
        game.getGameID(),
        game.getPlayerTwo(),
        'PlayerTwoWinPoint',
        'PlayerTwoWinGame',
      );
    } else {
      this.emitWinnerPoint(
        server,
        game.getGameID(),
        game.getPlayerOne(),
        'PlayerOneWinPoint',
        'PlayerOneWinGame',
      );
    }
  }

  emitWinnerPoint(
    server: Server,
    gameID: string,
    player: Player,
    messageWinPoint: string,
    messageWinGame: string,
  ): void {
    player.setPoint(player.getPoint() + 1);
    if (player.getPoint() === 5) {
      server.in(gameID).emit(messageWinGame);
    } else {
      server.in(gameID).emit(messageWinPoint);
    }
  }

  adaptNewPosition(newPos: number): number {
    if (newPos <= -this.Globals.ballCollision) {
      newPos = -this.Globals.ballCollision;
    } else if (newPos >= this.Globals.ballCollision) {
      newPos = this.Globals.ballCollision;
    }
    return newPos;
  }

  playerMovement(server: Server, socket: Socket, keycode: string): void {
    const game = this.Games.find(
      (element) =>
        element.getPlayerOne().getSocketID() === socket.id ||
        element.getPlayerTwo().getSocketID() === socket.id,
    );
    if (game === undefined) {
      return;
    }

    const player = this.findPlayer(game, socket);
    this.updatePosition(player, keycode);
    server
      .in(game.getGameID())
      .emit('someoneMoved', player.getLogin(), player.getPosY());
  }

  updatePosition(player: Player, keycode: string): void {
    if (keycode === 'w') {
      if (
        player.getPosY() + this.Globals.stepPlayer <
        this.Globals.paddleCollision
      ) {
        player.setPosY(player.getPosY() + this.Globals.stepPlayer);
      } else {
        player.setPosY(this.Globals.paddleCollision);
      }
    } else if (keycode === 's') {
      if (
        player.getPosY() - this.Globals.stepPlayer >
        -this.Globals.paddleCollision
      ) {
        player.setPosY(player.getPosY() - this.Globals.stepPlayer);
      } else {
        player.setPosY(-this.Globals.paddleCollision);
      }
    }
  }

  findPlayer(game: Game, socket: Socket): Player {
    let player: Player;
    if (game.getPlayerOne().getSocketID() === socket.id) {
      player = game.getPlayerOne();
    } else {
      player = game.getPlayerTwo();
    }
    return player;
  }
}
