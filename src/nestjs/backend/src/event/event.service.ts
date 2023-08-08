import { Ball } from './ball.service';
import { Game } from './game.service';
import { Injectable } from '@nestjs/common';
import { Player } from './player.service';
import { Server, Socket } from 'socket.io';
import { WebSocketServer } from '@nestjs/websockets';
@Injectable()
export class EventService {
  private readonly stepPlayer: 0.1;
  private readonly heightPlayer: 0.5;
  private readonly widthPlayer: 0.1;
  private readonly lengthBall: 0.15;
  private readonly border: 2;
  private readonly IncreaseBallSpeed: 0.001;

  @WebSocketServer()
  server: Server;
  Players: Player[] = [];
  PlayersNormalQueue: Player[] = [];
  PlayersCustomQueue: Player[] = [];
  Games: Game[] = [];

  connection(login: string, socket: Socket) {
    const newPlayer = new Player(login, socket.id);
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === newPlayer.getLogin(),
    );
    if (indexPlayer == -1) {
      this.Players.push(newPlayer);
    } else {
      socket.emit('alreadyConnect');
    }
  }

  disconnectRefresh(socket: Socket) {
    const index: number = this.Players.findIndex(
      (element) => element.getSocketID() == socket.id,
    );
    if (index == -1) {
      return;
    }
    const playerDisconnected = this.Players[index];
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    this.PlayersNormalQueue = this.PlayersNormalQueue.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', playerDisconnected.getLogin());
  }

  disconnectReturnHome(login: string, socket: Socket) {
    this.Players = this.Players.filter(
      (element) => element.getSocketID() != socket.id,
    );
    this.PlayersNormalQueue = this.PlayersNormalQueue.filter(
      (element) => element.getSocketID() != socket.id,
    );
    socket.broadcast.emit('playerDisconnected', login);
  }

  joinNormalQueue(login: string, socket: Socket) {
    const indexPlayer = this.Players.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayer == -1) {
      return;
    }
    const indexPlayerQueue = this.PlayersNormalQueue.findIndex(
      (element) => element.getLogin() === login,
    );
    if (indexPlayerQueue != -1) {
      socket.emit('alreadyInQueue');
      return;
    }
    const firstPlayer = this.Players[indexPlayer];
    if (this.PlayersNormalQueue.length >= 1) {
      const secondPlayer = this.PlayersNormalQueue.pop();
      firstPlayer.setPosX(-this.border + this.widthPlayer / 2);
      secondPlayer.setPosX(this.border - this.widthPlayer / 2);
      const newGame = new Game('NormalGame', firstPlayer, secondPlayer);
      this.Games.push(newGame);
      socket
        .to(secondPlayer.getSocketID())
        .emit('gameStarted', JSON.stringify(newGame));
      socket.emit('gameStarted', JSON.stringify(newGame));
    } else {
      this.PlayersNormalQueue.push(firstPlayer);
    }
  }

  movementPlayer(data: { login: string; keyCode: string }) {
    const index = this.Players.findIndex(
      (element) => element.getLogin() === data[0],
    );
    if (index == -1) {
      return;
    }
    const Player = this.Players[index];
    const offSet = this.heightPlayer / 2 + this.stepPlayer;
    if (data[1] == 'w') {
      if (Player.getPosY() + offSet < this.border) {
        Player.setPosY(Player.getPosY() + this.stepPlayer);
      } else {
        Player.setPosY(this.border - this.heightPlayer / 2);
      }
    } else if (data[1] == 's') {
      if (Player.getPosY() - offSet > -this.border) {
        Player.setPosY(Player.getPosY() - this.stepPlayer);
      } else {
        Player.setPosY(-this.border + this.heightPlayer / 2);
      }
    }
    this.server.emit('someoneMoved', data[1], Player);
  }

  sleep(ms) {
    new Promise((r) => setTimeout(r, ms));
  }

  updateDirectionX(ball: Ball, collide: string): void {
    let newPosition;
    if (collide == 'Wall') {
      if (ball.getPositionX() - this.lengthBall / 2 <= -this.border) {
        newPosition = -this.border + this.lengthBall / 2;
      } else {
        newPosition = this.border - this.lengthBall / 2;
      }
    } else {
      if (
        ball.getPositionX() - this.lengthBall / 2 <=
        -(this.border - this.widthPlayer)
      ) {
        newPosition = -(this.border - this.widthPlayer) + this.lengthBall / 2;
      } else {
        newPosition = this.border - this.widthPlayer - this.lengthBall / 2;
      }
    }
    ball.setPositionX(newPosition);
    ball.setDirectionX(-ball.getDirectionX());
    ball.setHitSomething(true);
  }
  updateDirectionY(ball: Ball, collide: string): void {
    let newPosition;
    if (collide == 'Wall') {
      if (ball.getPositionY() - this.lengthBall / 2 <= -this.border) {
        newPosition = -this.border + this.lengthBall / 2;
      } else {
        newPosition = this.border - this.lengthBall / 2;
      }
    } else {
      if (
        ball.getPositionY() - this.lengthBall / 2 <=
        -(this.border - this.widthPlayer)
      ) {
        newPosition = -(this.border - this.widthPlayer) + this.lengthBall / 2;
      } else {
        newPosition = this.border - this.widthPlayer - this.lengthBall / 2;
      }
    }
    ball.setPositionY(newPosition);
    ball.setDirectionY(-ball.getDirectionY());
    ball.setHitSomething(true);
  }

  HitPlayer = (ball: Ball, playerOne: Player, playerTwo: Player): boolean => {
    if (
      ball.getPositionX() < 0 &&
      ball.getPositionY() >= playerOne.getPosY() - 0.25 &&
      ball.getPositionY() <= playerOne.getPosY() + 0.25
    ) {
      return true;
    } else if (
      ball.getPositionX() > 0 &&
      ball.getPositionY() >= playerTwo.getPosY() - 0.25 &&
      ball.getPositionY() <= playerTwo.getPosY() + 0.25
    ) {
      return true;
    }
    return false;
  };

  async movementBall(socket: Socket) {
    await this.sleep(15);
    //need to find the good matchs
    const ball = this.Games[0].getBall();
    const playerOne = this.Games[0].getPlayerOne();
    const playerTwo = this.Games[0].getPlayerTwo();
    ball.setHitSomething(false);
    ball.setPositionX(
      ball.getPositionX() + ball.getDirectionX() * ball.getSpeed(),
    );
    ball.setPositionY(
      ball.getPositionY() + ball.getDirectionY() * ball.getSpeed(),
    );

    if (
      ball.getPositionX() - this.lengthBall / 2 <= -this.border ||
      ball.getPositionX() + this.lengthBall / 2 >= this.border
    ) {
      this.updateDirectionX(ball, 'Wall');
    }
    if (
      ball.getPositionY() - this.lengthBall / 2 <= -this.border ||
      ball.getPositionY() + this.lengthBall / 2 >= this.border
    ) {
      this.updateDirectionY(ball, 'Wall');
    }
    const offSet = this.border - this.widthPlayer;
    if (
      (ball.getPositionX() - this.lengthBall / 2 <= -offSet ||
        ball.getPositionX() + this.lengthBall / 2 >= offSet) &&
      this.HitPlayer(ball, playerOne, playerTwo)
    ) {
      this.updateDirectionX(ball, 'Player');
    }
    if (ball.getHitSomething()) {
      ball.setSpeed(ball.getSpeed() + this.IncreaseBallSpeed);
    }
    socket.emit('movementBall', ball.getPositionX(), ball.getPositionY());
  }
}
